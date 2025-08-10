const BASE_URL = 'https://random-word-api.vercel.app/api';

async function getWords(count = 2) {
  try {
    // console.log(`${BASE_URL}/word?${count}`);
    const response = await fetch(`${BASE_URL}?words=${count}`);
        
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching word data:', error);
  }
}

module.exports = {
  getWords
};