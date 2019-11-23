const Twitter = require('twitter')
const config = require("./config")
const fs = require('fs');
const client = new Twitter(config);


const frequencyLikeInMinutes = 30
//30minutes
// setInterval(likeBot, 1000 * 60 * frequencyLikeInMinutes);
function getParams() {
  const params = {
    q: '(%23100DaysOfCode)%20-filter%3Areplies',
    result_type: 'recent',
    count: 100
  }
  return params
}

likeBot();

function likeBot() {
  
  console.log('--- Bot started --- \n')

  verifyRateLimit()

  function verifyRateLimit() {
  
    client.get('application/rate_limit_status', function(error, data) {
      
      if(!error) {
      
        const remaining = data.resources.search['/search/tweets'].remaining;

        if(remaining > 10) {

          searchTweetsForLike()

        } else {
          console.log('erro: rate_limit_status')
        }
      }
  
    })
  }

  
function searchTweetsForLike () {

  client.get('search/tweets', getParams(), function(error, data) {
  
    if(!error) {
  
      const tweets = data.statuses

      const sanitizedTweets = filtersTheGoodOnes(tweets)

      sanitizedTweets ? tryToFavorite(sanitizedTweets) : console.log("no good tweet found 😢")

    } else {
      console.log(error) 
    }
  
  })
 
}

function filtersTheGoodOnes(tweets) {
  
  const arrayOfTweets = Array.from(tweets)

  const containsRestrictedWords = /^((?!free|coupons|coupon).)*$/gim;
  
  const containsDay = /(day\d{1,2})|(day \d{1,2})|(D \d{1,2})|(D-\d{1,2})|(day-\d{1,2})|(\d{1,2}\/100+)/gim

  const sanitizedTweets = arrayOfTweets.filter((tweet) => {
    
    return  !tweet.retweeted_status && 
            !containsRestrictedWords.test(tweet.text) && 
            containsDay.test(tweet.text) && 
            tweet.entities.hashtags.length <= 5 
  })

  return sanitizedTweets
}

function tryToFavorite(tweets) {

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


function saveFileTodebug(data) {
  fs.writeFile("debug.txt", JSON.stringify(data), function(err) {

    if(err) {
        return console.log(err);
    }

    console.log("The file was saved!");
  }); 
}