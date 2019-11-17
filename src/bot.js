const Twitter = require('twitter')
const config = require("./config")
const fs = require('fs');
const client = new Twitter(config);

likeBot();
//10minutes
setInterval(likeBot, 600000);

function likeBot() {

  console.log('Bot started')

  searchTweetsForLike()

  function getParams() {
    const params = {
      q: '#100daysofcode',
      result_type: 'recent',
      count: 70
    }
    return params
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

    const regexIsRetweet = /^RT/;
    
    const regexContainsDay = /(day[0-9]+)|(day [0-9])|(D [0-9])|(D[0-9])|(today)|(day-[0-9]+)|([0-9]+\/[0-9]+)/gi

    const sanitizedTweets = arrayOfTweets.filter((tweet) => {

      return !regexIsRetweet.test(tweet.text) && 
              regexContainsDay.test(tweet.text) && 
              tweet.entities.hashtags.length <= 5 &&
              tweet.lang  === 'en'
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