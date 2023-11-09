const express = require('express')
const axios = require('axios')
const cheerio = require('cheerio')

const app = express()
app.set('view engine', 'ejs')



const bodyParser = require('body-parser')
const urlencodedparser = bodyParser.urlencoded({ extended: false })


// Sets a home page for the default route
app.get('/', (req, res) => {
    res.render('index')
})


// GET route to use the scraper based on a keyword
app.get('/api/scraper', urlencodedparser, async (req, res) => {
    const keyword = req.query.keyword;


    /* Uses the get method from axios to make a HTTP request through the URL using thkeye given word
    then uses cheerio to load the data axios brought and parse the data
    */

    try {
        const response = await axios.get(`https://www.amazon.com/s?k=${keyword}`, {
            headers: {
                Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                Host: 'www.amazon.com',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
            },
        });

        const $ = cheerio.load(response.data);


        /* Sets an array for each one of the info wanted, goes through the whole HTML requested and 
        fills the array based on the filter parameters 
        */


        let titles = [];
        $('h2 a span').each((index, element) => {
            titles.push($(element).text());
        });

        let ratings = [];
        $('i span').each((index, element) => {
            ratings.push($(element).text());
        });

        let numberOfReviews = [];
        $('span.a-size-base.s-underline-text').each((index, element) => {
            numberOfReviews.push($(element).text());
        });

        const produtos = [];

        /* In theory if we have n titles we have n ratings and reviews too, so this loop 
        fills a product object based on the index of the arrays of the atributes, then fills
        the product array and send it to the page
        */

        for (let i = 0; i < titles.length; i++) {

            try {
                const produto = {
                    title: titles[i],
                    ratings: ratings[i],
                    numberOfReviews: numberOfReviews[i],
                };
                produtos.push(produto);
            } catch (error) {
                console.log(error, "Algo deu errado no scraping")
            }

        }
        res.render('results',{produtos});
        console.log(produtos)
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro no scraping');
    }
});

// Runs the server
app.listen(3000, () => {
    console.log('Servidor rodando');
});