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

// POST route to use the scraper based on a keyword
app.post('/api/scraper', urlencodedparser, async (req, res) => {
    const keyword = req.query.keyword

    /* Uses the 'get' method from axios to make an HTTP request via the URL using the given word
     then uses Cheerio to load the data brought by axios and parse the data
    */

    try {
        const response = await axios.get(`https://www.amazon.com/s?k=${keyword}`, {
            headers: {
                Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                Host: 'www.amazon.com',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
            }
        })

        const $ = cheerio.load(response.data)

        /* Sets an array for each of the info wanted, goes through the entire HTML requested and 
         fills the array based on the filter parameters
        */

        let titles = []
        $('h2 a span').each((index, element) => {
            titles.push($(element).text())
        })

        let ratings = []
        $('i span').each((index, element) => {
            ratings.push($(element).text())
        })

        let numberOfReviews = []
        $('span.a-size-base.s-underline-text').each((index, element) => {
            numberOfReviews.push($(element).text())
        })

        const produtos = []

        /*  In theory, if we have 'n' titles, we have 'n' ratings and reviews too 
        This loop fills a product object based on the index of the arrays of the attributes
        then fills the product array and sends it to the page
        */

        for (let i = 0; i < titles.length; i++) {

            try {
                const produto = {
                    title: titles[i],
                    ratings: ratings[i],
                    numberOfReviews: numberOfReviews[i]
                }
                produtos.push(produto)
            } catch (error) {
                console.log(error, "Something went wrong with the scraping")
            }
        }
        res.json(produtos)
        console.log(produtos)
    } catch (error) {
        console.error(error)
        res.status(500).send( "Something went wrong with the scraping")
    }
})

// Runs the server
app.listen(3000, () => {
    console.log('Server is running')
})
