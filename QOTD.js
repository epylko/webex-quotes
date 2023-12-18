import xapi from 'xapi';
xapi.config.set('HttpClient Mode', 'On');

//
// API from https://opensourcelibs.com/lib/quotegarden
//

//
// This macro is built around the way this quote server responds.
//
const url = 'https://api.quotable.io/random?maxLength=105';

//
// get a random quote from the quote server
// repeat if quote length is > 128 characters (max CustomMessage size)
//
async function* getQuote(Url) {
  while (true) {
    const result = await xapi.Command.HttpClient.Get({Url})
    const data = JSON.parse(result.Body)
      
    const quote = data.author + ": " + data.content
    
    if (quote.length <= 128) {
      yield quote
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
  let quote
  for await (const result of getQuote(url)) {
    quote = result   
  }
  xapi.Config.UserInterface.CustomMessage.set(quote)
})
