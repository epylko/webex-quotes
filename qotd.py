#!/usr/bin/env python3

import xows
import asyncio
import requests
import socket
import random
from time import sleep

# set your username and passwword here for WebEx device login
USERNAME=""
PASSWORD=""
DEVICEIP=""

#
# this uses pubic RFC QOTD servers
#
def rfcqotd():
  QOTDSERVERS = ["djxmmx.net", "alpha.mike-r.com"]
  server = random.choice(QOTDSERVERS)
  serveraddr = (server, 17)
  q = socket.create_connection(serveraddr)
  quote = q.recv(4096)
  q.close()
  return (quote.decode("utf-8"))

#
# this uses a rest API to quote-garden.herokuapp.com
# example: https://quote-garden.herokuapp.com/api/v3/quotes/random
# as of 12/6/21 there are 72672 pages
#
def restqotd():
  BASEURL="https://quote-garden.herokuapp.com/api/v3/quotes/random"

  try:
    response = requests.get(BASEURL)
    jsonResponse = response.json()
    data = jsonResponse["data"]

    quote = data[0]["quoteText"]
    author = data[0]["quoteAuthor"]

    str = (author+":"+quote)

    if len(str) > 128:
      # try not to overwhelm the quote server
      sleep(10)
      # recurse until we get a quote that is <= 128 characters
      return(restqotd())
    else:
      return (str)
  except requests.ConnectionError as error:
    return("Quote server unavailable")

#
#
#
async def update(quote):
  async with xows.XoWSClient(DEVICEIP, username=USERNAME, password=PASSWORD) as deskpro:
    await deskpro.xSet(['Configuration', 'UserInterface', 'CustomMessage'], quote)

quote = restqotd()
#quote = rfcqotd()
asyncio.run(update(quote))
