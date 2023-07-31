import { tweetsData } from './data.js'
import { v4 as uuidv4 } from 'https://jspm.dev/uuid';

const tweetsFromLocalStorage = JSON.parse(localStorage.getItem('savedTweetsData'))
let arrayOfTweets = []

if(tweetsFromLocalStorage) {
    arrayOfTweets = tweetsFromLocalStorage
} else {
    arrayOfTweets = tweetsData
}

document.addEventListener('click', function(e){
    if(e.target.dataset.like){
       handleLikeClick(e.target.dataset.like) 
    }
    else if(e.target.dataset.retweet){
        handleRetweetClick(e.target.dataset.retweet)
    }
    else if(e.target.dataset.reply){
        handleReplyClick(e.target.dataset.reply)
    }
    else if(e.target.id === 'tweet-btn'){
        handleTweetBtnClick()
    }
    else if(e.target.dataset.deleteTweet) {
        handleDeleteTweet(e.target.dataset.deleteTweet)
    }
    else if(e.target.dataset.deleteReply) {
        handleDeleteReply(e.target.dataset.deleteReply)
    }
    else if(e.target.closest('[data-write-reply]')) {
        if(e.target.dataset.writeReplyBtn) {
            postNewReply(e.target.dataset.writeReplyBtn)
        }
    }
    else if(e.target.closest('[data-tweet-reply]')) {
        return;
    }
    else if(e.target.closest('[data-main-tweet]')) {
        showReplyTextarea(e.target.closest('[data-main-tweet]'))
    }
    
})

function saveToLocalStorage() {
    localStorage.setItem('savedTweetsData', JSON.stringify(arrayOfTweets))
}
 
function handleLikeClick(tweetId){ 
    
    const targetTweetObj = arrayOfTweets.filter(function(tweet){
        return tweet.uuid === tweetId
    })[0]

    if (targetTweetObj.isLiked){
        targetTweetObj.likes--
    }
    else{
        targetTweetObj.likes++ 
    }
    targetTweetObj.isLiked = !targetTweetObj.isLiked
    
    saveToLocalStorage()

    render()
}

function handleRetweetClick(tweetId){
    const targetTweetObj = arrayOfTweets.filter(function(tweet){
        return tweet.uuid === tweetId
    })[0]
    
    if(targetTweetObj.isRetweeted){
        targetTweetObj.retweets--
    }
    else{
        targetTweetObj.retweets++
    }
    targetTweetObj.isRetweeted = !targetTweetObj.isRetweeted

    saveToLocalStorage()

    render() 
}

function handleReplyClick(replyId){
    document.getElementById(`replies-${replyId}`).classList.toggle('hidden')  
}

function handleTweetBtnClick(){
    const tweetInput = document.getElementById('tweet-input')

    if(tweetInput.value){
        arrayOfTweets.unshift({
            handle: `@edgar`,
            profilePic: `images/edgar03.jpg`,
            likes: 0,
            retweets: 0,
            tweetText: tweetInput.value,
            replies: [],
            isLiked: false,
            isRetweeted: false,
            uuid: uuidv4(),
            canDelete: true
        })

    render()
    
    saveToLocalStorage()

    tweetInput.value = ''
    }

}

function showReplyTextarea(tweetContainer) {
    arrayOfTweets.forEach(function(tweet) {
        if(tweet.uuid === tweetContainer.dataset.mainTweet) {
            document.getElementById(`write-reply-${tweet.uuid}`).classList.toggle('hidden')
        } else {
            document.getElementById(`write-reply-${tweet.uuid}`).classList.add('hidden') 
        }
    })
}

function postNewReply(replyContainerId) {
    const newReplyInput = document.getElementById(`text-area-${replyContainerId}`)
    
    if(newReplyInput.value) {
        let tweetId = ''
    
        let newReplyObj = {
            handle: `@edgar`,
            profilePic: `images/edgar03.jpg`,
            likes: 0,
            retweets: 0,
            tweetText: newReplyInput.value,
            replies: [],
            isLiked: false,
            isRetweeted: false,
            uuid: uuidv4(),
            canDelete: true
        }
    
        arrayOfTweets.forEach(function(tweet) {
            
            if(tweet.uuid === replyContainerId) {
                tweetId = tweet.uuid
                tweet.replies.unshift(newReplyObj)
            }
        })
        
        saveToLocalStorage()
   
        render()
        handleReplyClick(tweetId)
    }
}

function addDeleteIconToTweet() {
    
   arrayOfTweets.forEach(function(tweet) {
        if(tweet.canDelete) {
            document.getElementById(`delete-tweet-${tweet.uuid}`).classList.remove("hidden")
        }
    })
}

function addDeleteIconToReply() {
    
    arrayOfTweets.forEach(function(tweet) {
        tweet.replies.forEach(function(reply) {
            if(reply.canDelete) {
                const deleteReplyDiv = document.getElementById(`delete-reply-${reply.uuid}`)
                deleteReplyDiv.innerHTML = `
                    <div id="delete-reply-${uuidv4()}">
                        <span class="tweet-detail right">
                            <i class="fa-solid fa-trash-can"
                            data-delete-reply="${reply.uuid}"
                            ></i>
                        </span>
                    </div>`
            }
        })
    })
}

function handleDeleteTweet(tweetId) {
    
    arrayOfTweets.forEach(function(tweet, index) {
        if(tweet.uuid === tweetId) {
            arrayOfTweets.splice(index, 1)
        }
    })
    
    saveToLocalStorage()

    render()
}

function handleDeleteReply(replyId) { 
    let tweetId = ''
    
     arrayOfTweets.forEach(function(tweet) {
        tweet.replies.forEach(function(reply, index) {
            if(replyId === reply.uuid) {
                tweetId = tweet.uuid
                tweet.replies.splice(index, 1)
            }
        })
    })

    saveToLocalStorage()

    render()
    handleReplyClick(tweetId)
}


function getFeedHtml(){
    let feedHtml = ``

    arrayOfTweets.forEach(function(tweet){
        
        let likeIconClass = ''
        
        if (tweet.isLiked){
            likeIconClass = 'liked'
        }
        
        let retweetIconClass = ''
        
        if (tweet.isRetweeted){
            retweetIconClass = 'retweeted'
        }
        
        let repliesHtml = ''
        
        if(tweet.replies.length > 0){
            tweet.replies.forEach(function(reply){
                
                repliesHtml+=`
                    <div class="tweet-reply" data-tweet-reply="${tweet.uuid}">
                        <div class="tweet-inner">
                            <img src="${reply.profilePic}" class="profile-pic">
                            <div>
                                <p class="handle">${reply.handle}</p>
                                <p class="tweet-text">${reply.tweetText}</p>
                            </div>
                            <div id="delete-reply-${reply.uuid}"></div>
                        </div>
                    </div>
                    `
            })
        }
          
        feedHtml += `
            <div class="tweet" data-main-tweet="${tweet.uuid}">
                <div class="tweet-inner">
                    <img src="${tweet.profilePic}" class="profile-pic">
                    <div>
                        <p class="handle">${tweet.handle}</p>
                        <p class="tweet-text">${tweet.tweetText}</p>
                        <div class="tweet-details">
                            <span class="tweet-detail">
                                <i class="fa-regular fa-comment-dots"
                                data-reply="${tweet.uuid}"
                                ></i>
                                ${tweet.replies.length}
                            </span>
                            <span class="tweet-detail">
                                <i class="fa-solid fa-heart ${likeIconClass}"
                                data-like="${tweet.uuid}"
                                ></i>
                                ${tweet.likes}
                            </span>
                            <span class="tweet-detail">
                                <i class="fa-solid fa-retweet ${retweetIconClass}"
                                data-retweet="${tweet.uuid}"
                                ></i>
                                ${tweet.retweets}
                            </span>
                            <span class="tweet-detail hidden" id="delete-tweet-${tweet.uuid}">
                                <i class="fa-solid fa-trash-can"
                                data-delete-tweet="${tweet.uuid}"
                                ></i>
                            </span>
                        </div>   
                    </div>            
                </div>
                <div class="hidden new-reply-container" data-write-reply="${tweet.uuid}" id="write-reply-${tweet.uuid}">
                    <div class="new-reply-inner">
                        <img src="images/edgar03.jpg" class="new-reply-img">
                        <textarea placeholder="write your reply" id="text-area-${tweet.uuid}" class="new-reply-text-area"></textarea>
                    </div>
                    <button data-write-reply-btn="${tweet.uuid}" class="new-reply-btn">Reply</button>
                </div> 
                <div class="hidden" id="replies-${tweet.uuid}">
                    ${repliesHtml}
                </div> 
            </div> 
            `
   })
    return feedHtml
}

function render(){
    document.getElementById('feed').innerHTML = getFeedHtml()
    addDeleteIconToTweet()
    addDeleteIconToReply()
}

render()
