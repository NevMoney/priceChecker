require('dotenv').config()
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const nightmare = require('nightmare')()

const inputs = process.argv.slice(2)
const url = inputs[0]
const myPrice = parseFloat(inputs[1])
const myAddress = inputs[2]

checkPrice()

async function checkPrice() {
  try {
    const priceString = await nightmare
      .goto(url)
      .wait('#priceblock_dealprice')
      .evaluate(() => document.getElementById('priceblock_dealprice').innerText)
      .end()

    const price = parseFloat(priceString.replace('$', ''))
    console.log('price', price)

    if (price < myPrice) {
      await sendEmail(
        'Price fell!',
        `The price on ${url} has dropped below your requested price of $${myPrice} and is currently selling for $${price}.`,
        myAddress,
      )
      console.log('Buy!')
    }
  } catch (error) {
    await sendEmail('Price Checker ERROR', error.message)
    console.error(error)
    throw error
  }
}

async function sendEmail(subject, body, myAddress) {
  const email = {
    from: 'nev@1dealaway.com',
    personalizations: [
      {
        to: [
          {
            email: myAddress,
          },
        ],
      },
    ],
    subject: subject,
    text: body,
    html: body,
  }
  try {
    let messageSent = await sgMail.send(email)
    console.log('messageSent', messageSent)
  } catch (error) {
    console.log('error', error)
  }
}
