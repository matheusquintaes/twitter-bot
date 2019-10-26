const Twitter = require('twitter')
const config = require("./config")

const client = new Twitter(config);

likeBot();
//10 minutes
setInterval(likeBot, 600000);

function likeBot() {

  console.log('Bot started')

  searchTweetsForLike()

  function searchTweetsForLike () {

    client.get('search/tweets', getParams(), function(error, data, response) {
    
      if(!error) {
    
        const tweets = data.statuses
        
        tryToFavoriteTweets(tweets)
    
      } else {
        console.log(error) 
      }
    
    })
    
    function getParams() {
      const params = {
        q: '#100daysofcode',
        result_type: 'recent'
      }
      return params
    }
  }

  function tryToFavoriteTweets(tweets) {

    for (let i = 0; i < tweets.length; i++) {
  
      let tweetId = { id: tweets[i].id_str }
      
      client.post('favorites/create', tweetId, function (error, response) {
        if (!error) {
          
          let username = response.user.screen_name;
          let tweetIdString = response.id_str;

          showFavoriteTweet(username,tweetIdString)
          
        } else {
          console.log(error) 
        }
      })
     
    }

    function showFavoriteTweet(username, tweetIdString){
      return console.log('Favorited: ', `https://twitter.com/${username}/status/${tweetIdString}`)
    }
  }
  
}
