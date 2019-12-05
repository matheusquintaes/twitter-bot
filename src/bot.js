const Twitter = require('twitter')
const config = require("./config")
const fs = require('fs');
const client = new Twitter(config);


const frequencyLikeInMinutes = 10 //30minutes
let likes = 0;

setInterval(likeBot, 1000 * 60 * frequencyLikeInMinutes);

function getParams() {
  const params = {
    q: '-RT%20-free%20-coupons%20-coupon%20(%23100DaysOfCode)', //-RT -free -coupons -coupon (#100DaysOfCode)
    result_type: 'recent',
    count: 15,
    lang: 'en'
  }
  return params
}

likeBot();


function likeBot() {
  

  console.log('--- Bot started --- \n')
  console.log(`--- Likes count:  ${likes} --- \n`)

  verifyRateLimit()

  function verifyRateLimit() {
  
    client.get('application/rate_limit_status', function(error, data) {
      
      if(!error) {
      
        const remaining = data.resources.search['/search/tweets'].remaining;

        console.log(`--- Limit remaining ${remaining} ---\n`)

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

        // debug('sanitizedTweets', sanitizedTweets)
        
        sanitizedTweets ? tryToFavorite(sanitizedTweets) : console.log("no good tweet found 😢")

      } else {
        console.log(error) 
      }
    
    })
  
  }

  function filtersTheGoodOnes(tweets) {
    
    const arrayOfTweets = Array.from(tweets)

    const containsDay = /(day\d{1,2})|(day \d{1,2})|(D \d{1,2})|(D-\d{1,2})|(day-\d{1,2})|(\d{1,2}\/100+)/gim

    const sanitizedTweets = arrayOfTweets.filter((tweet) => {

      // debug('filtersTheGoodOnes', tweet)

      return  !tweet.retweeted_status && 
              containsDay.test(tweet.text) && 
              tweet.entities.hashtags.length <= 5 
    })

    return sanitizedTweets
  }

  function tryToFavorite(tweets) {
    
    likes += tweets.length

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


function debug(type, data) {

  if(type === 'sanitizedTweets') {
    const arrayOfTweets = Array.from(data)
    console.log(' \n\n\n sanitizedTweets  \n\n\n ')
    arrayOfTweets.forEach((item) => {
      console.log('--------------------------------------- \n' + item.text + '\n')
    })
  }
  
  else if(type === 'filtersTheGoodOnes') {
     console.log( '--------------------------------------- \n' +  data.text + '\n\n\n')

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