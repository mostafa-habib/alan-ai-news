intent('What does this app do?', 'What can I do here?', 
      reply('This is a news project.'));

const API_KEY = '4021f8f086174735b3c487d29e7644ac';
let savedArticles = [];
// News by Source
intent('(Give me | tell me | show me) the latest news', (p) => {
      let NEWS_API_URL = `https://newsapi.org/v2/everything?domains=wsj.com&apiKey=4021f8f086174735b3c487d29e7644ac`;


api.request(NEWS_API_URL, {headers: {"user-agent": 'user agent' }}, (error, response, body) => {
    const {  articles } = JSON.parse(body);
    
    if(!articles.length) {
        p.play('Sorry, please try searching for news from a different source');
        return;
    }
    
    savedArticles = articles;
    
    p.play({ command: 'newHeadlines', articles });
    p.play(`Here are (latest|recent) news.`);

    p.play('Would you like me to read the headlines?');
    p.then(confirmation);

});
})
intent('(Give me | tell me | show me) the news (from | by | on | in) $(source* .+)', (p) => {
    let NEWS_API_URL = `https://newsapi.org/v2/top-headlines`;
if(p.source.value) {
    p.source.value=p.source.value.toLowerCase().split(" ").join("-");
    NEWS_API_URL = `${NEWS_API_URL}?sources=${p.source.value}&apiKey=${API_KEY}`
}

api.request(NEWS_API_URL, {headers: {"user-agent": 'user agent' }}, (error, response, body) => {
    const {  articles } = JSON.parse(body);
    
    if(!articles.length) {
        p.play('Sorry, please try searching for news from a different source');
        return;
    }
    
    savedArticles = articles;
    
    p.play({ command: 'newHeadlines', articles });
    p.play(`Here are (latest|recent) ${p.source.value} news.`);

    p.play('Would you like me to read the headlines?');
    p.then(confirmation);

});
})

// News by Term
intent('what\'s up with $(term* .+)', (p) => {
let NEWS_API_URL = `https://newsapi.org/v2/everything`;
if(p.term.value) {
    p.term.value=p.term.value.toLowerCase().split(" ").join("-");
    NEWS_API_URL = `${NEWS_API_URL}?q=${p.term.value}&apiKey=${API_KEY}`
}

api.request(NEWS_API_URL, {headers: {"user-agent": 'user agent' }}, (error, response, body) => {
    const {  articles } = JSON.parse(body);
    
    if(!articles.length) {
        p.play('Sorry, please try searching for news from a different source');
        return;
    }
    
    savedArticles = articles;
    
    p.play({ command: 'newHeadlines', articles });
    p.play(`Here are the (latest|recent) articles on ${p.term.value}.`);
    
    p.play('Would you like me to read the headlines?');
    p.then(confirmation);
});
})

// News by Categories
const CATEGORIES = ['business', 'entertainment', 'general', 'health', 'science', 'sports', 'technology'];
const CATEGORIES_INTENT = `${CATEGORIES.map((category) => `${category}`).join('|')} `;

intent(`(show|what is|tell me|what's|what are|what're|read) (the|) (recent|latest|) $(N news|headlines) (in|about|on|) $(C~ ${CATEGORIES_INTENT})`,
  `(read|show|get|bring me|give me) (the|) (recent|latest) $(C* .+)  $(N news|headlines)`, (p) => {
    let NEWS_API_URL = `https://newsapi.org/v2/top-headlines`;

if(p.C.value) {
    console.log(p.C.value)
    NEWS_API_URL = `${NEWS_API_URL}?category=${p.C.value}&country=us&apikey=${API_KEY}`
}

api.request(NEWS_API_URL, (error, response, body) => {
    const { articles} = JSON.parse(body);
    
    if(!articles) {
        p.play('Sorry, please try searching for a different category.');
        return;
    }
    
    savedArticles = articles;
    
    p.play({ command: 'newHeadlines', articles });
    
    if(p.C.value) {
        p.play(`Here are the (latest|recent) articles on ${p.C.value}.`);        
    } else {
        p.play(`Here are the (latest|recent) news`);   
    }
    
    p.play('Would you like me to read the headlines?');
    p.then(confirmation);
});
});

const confirmation = context(() => {
    intent('yes', async (p) => {
        for(let i = 0; i < savedArticles.length; i++){
            p.play({ command: 'highlight', article: savedArticles[i]});
            p.play(`${savedArticles[i].title}`);
        }
    })
    
    intent('no', (p) => {
        p.play('Sure, sounds good to me.')
    })
})

intent('open (the|) (article|) (number|) $(number* (.*))', (p) => {
    if(p.number.value) {
        p.play({ command:'open', number: p.number.value, articles: savedArticles})
    }
})

intent('(go|) back', (p) => {
    p.play('Sure, going back');
    p.play({ command: 'newHeadlines', articles: []})
})
