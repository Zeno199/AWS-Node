
import boto
import uuid
import os
import boto3
from boto.sqs.message import RawMessage
from boto.sqs.message import Message
from boto.s3.key import Key
from io import BytesIO
import time
import logging
import json
import sys
import requests
import io
import urllib.request
import re


class Logger:
	def __init__(self):

		#self.stream_handler = logging.StreamHandler(self.stream)

		self.log = logging.getLogger('image-processor')
		self.log.setLevel(logging.INFO)
		for handler in self.log.handlers:
			self.log.removeHandler(handler)

	def info(self, message):
		self.log.info(message)

	def error(self, message):
		self.log.error(message)

logger = Logger()

#wordlist = ['testing', 'hello']

def lambda_handler(event, context):


    #sqs = boto3.resource('sqs')
    conn = boto.connect_sqs()

    #input_queue_name = sqs.get_queue_by_name(QueueName= event['Records']["Queue"]["input"])
    #output_queue_name = sqs.get_queue_by_name(QueueName= event['Records']["Queue"]["output"])
    print(event.items())

    input_queue_name = conn.get_queue(event["input"])
    output_queue_name = conn.get_queue(event["output"])

    region_name = event["Region"]


    s3_endpoint = [region.endpoint for region in boto.s3.regions() if region.name == region_name][0]


    s3_output_bucket = event["bucket-name"]

    if s3_output_bucket == "":
        s3_output_bucket = create_s3_output_bucket(s3_output_bucket, s3_endpoint, region_name)


    info_message('Retrieving jobs from queue %s. Processed images will be stored in %s and a message placed in queue %s' % (input_queue_name, s3_output_bucket, output_queue_name))

    try:

        sqs = boto.sqs.connect_to_region(region_name)
    except Exception as ex:
        error_message("Encountered an error setting SQS region.  Please confirm you have queues in %s." % (region_name))
        raise ex

    try:
        input_queue_name.set_message_class(RawMessage) # initialized  -> should append when evey write

    except Exception as ex:
        error_message("Encountered an error connecting to SQS queue %s. Confirm that your input queue exists." % (input_queue_name))
        raise ex

    try:
        output_queue_name.set_message_class(RawMessage)

    except Exception as ex:
        error_message("Encountered an error connecting to SQS queue %s. Confirm that your output queue exists." % (output_queue_name))
        raise ex


    info_message("Polling input queue...")


    while True:

        rs = input_queue_name.get_messages(num_messages=1)

        if len(rs) > 0:
			# Iterate each message
            for raw_message in rs:
                info_message("Message received...")
				# Parse JSON message (going two levels deep to get the embedded message)
                message = raw_message.get_body()

				# Create a unique job id
                job_id = str(uuid.uuid4())

				# Process the image, creating the image montage
                output_url = process_message(message, s3_output_bucket, s3_endpoint, job_id )

				# Sleep for a while to simulate a heavy workload
				# (Otherwise the queue empties too fast!)
                time.sleep(2)
                output_message = "Output available at: %s" % (output_url)

				# Write message to output queue
                write_output_message(output_message, output_queue_name)

                info_message(output_message)
                info_message("Image processing completed.")

				# Delete message from the queue
                input_queue_name.delete_message(raw_message)

        time.sleep(5)






def create_s3_output_bucket(s3_output_bucket, s3_endpoint, region_name):

	# Connect to S3
	s3 = boto.connect_s3(host=s3_endpoint)

	# Find any existing buckets starting with 'image-bucket'
	buckets = [bucket.name for bucket in s3.get_all_buckets() if bucket.name.startswith('my-bucket')]
	if len(buckets) > 0:
	  return buckets[0]

	# No buckets, so create one for them
	name = 'my-bucket-' + str(uuid.uuid4())

	if region_name == 'us-east-1': # version and speical case problem
		s3.create_bucket(name)
	else:
		s3.create_bucket(name, location=region_name)

	return name




##############################################################################
# Process a newline-delimited list of URls
##############################################################################
def process_message(message, s3_output_bucket, s3_endpoint, job_id):
	try:

		output_dir = "/tmp/"

		# Download images from URLs specified in message
		for line in message.splitlines():
			info_message("Downloading image from %s" % line)
			#print('split ',line.split('/')[-1])
			f_name = output_dir + line.split('/')[-1]
			response = urllib.request.urlopen(line)
			#print('f:', f_name)
			out_file = open(f_name , 'wb')
			data = response.read()
			out_file.write(data)

		output_image_name = "output-%s.jpg" % (job_id)
		output_image_path = output_dir + output_image_name
		print('out_name', output_image_path)

		# Invoke ImageMagick to create a montage
		os.system("montage -size 400x400 null: %s*.* null: -thumbnail 400x400 -bordercolor white -background black +polaroid -resize 80%% -gravity center -background black -geometry -10+2  -tile x1 %s" % (output_dir, output_image_path))

		os.system("ls /tmp")
		print('montage suc')
		# Write the resulting image to s3
		output_url = write_image_to_s3(output_image_path, output_image_name, s3_output_bucket, s3_endpoint)

		# Return the output url
		return output_url
	except:
		error_message("An error occurred. Please show this to your class instructor.")
		error_message(sys.exc_info()[0])


##############################################################################
# Write the result of a job to the output queue
##############################################################################
def write_output_message(message, output_queue):
	m = RawMessage()
	m.set_body(message)
	status = output_queue.write(m)




##############################################################################
# Write an image to S3
##############################################################################
def write_image_to_s3(path, file_name, s3_output_bucket, s3_endpoint):

	s3 = boto3.client('s3')
	s3_resoucre = boto3.resource('s3')
	output = s3_resoucre.Bucket(s3_output_bucket)

	info_message("set key1")
	print('p:', path, file_name)

	#s3.upload_file(path, file_name, file_name)
	#r = requests.get(message)
	f = open(path, "rb")

	#print('fed')

	output.put_object(Key = file_name ,  ACL= 'public-read', ContentType = "image/jpeg",  Body = f)
	#f.close()
	# Return a URL to the object
	return "https://%s.s3.amazonaws.com/%s" % (s3_output_bucket, file_name)

def info_message(message):
	logger.info(message)

def error_message(message):
	logger.error(message)
