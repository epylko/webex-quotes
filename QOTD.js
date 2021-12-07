import xapi from 'xapi';
xapi.config.set('HttpClient Mode', 'On');

//
// API from https://opensourcelibs.com/lib/quotegarden
//

//
// This macro is built around the way this quote server responds.
//
const url = 'https://quote-garden.herokuapp.com/api/v3/quotes/random';

//
// get a random quote from the quote server
// repeat if quote length is > 128 characters (max CustomMessage size)
//
async function* getQuote(Url) {
  while (true) {
    const result = await xapi.Command.HttpClient.Get({Url})
    const data = JSON.parse(result.Body)
    const {data: [{quoteText: text, quoteAuthor: author}]} = data
    const str = author + ": " + text

    if (str.length <= 128) {
      yield str
      return
    } else {
      yield false
      await new Promise((resolve) => setTimeout(resolve, 500))
    }
  }
}

//
// When a call hangs up, get the quote and update CustomMessage
//
xapi.event.on('CallDisconnect', async (event) => {
  let str
  for await (const result of getQuote(url)) {
    str = result   
  }
  xapi.Config.UserInterface.CustomMessage.set(str)
})