const axios = require('axios');

exports.getExchangeRates = async (req, res) => {
  try {
    // የቀጥታ የምንዛሬ ተመኖችን ከኤፒአይ መሳብ
    // (ከዶላር $ ጋር ያሉትን ተመኖች ያመጣል)
    const response = await axios.get('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json');
    
    const usdRates = response.data.usd;

    // እኛ የምንፈልጋቸውን ዋና ዋና ምንዛሬዎች ብቻ ለይቶ ማውጣት
    const filteredRates = {
      ETB: usdRates.etb, // የኢትዮጵያ ብር
      EUR: usdRates.eur, // ዩሮ
      GBP: usdRates.gbp, // ፓውንድ
      AED: usdRates.aed, // የዱባይ ዲርሃም
    };

    res.status(200).json({
      base: "USD",
      date: response.data.date,
      rates: filteredRates
    });
  } catch (error) {
    res.status(500).json({ message: 'የምንዛሬ ተመኖችን ማምጣት አልተቻለም', error: error.message });
  }
};