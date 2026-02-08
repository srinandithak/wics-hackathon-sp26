import SerpApi from 'serpapi';

const SERPAPI_KEY = '1367b608124e5bb349fe5f3c0292f6cf8f9c43ee5173a98b54993bf9d921418d'; 

export const searchArtistEvents = async (artistName, location = 'Austin, Texas') => {
  try {
    const client = new SerpApi.GoogleSearch(SERPAPI_KEY);
    
    // Search for events
    const searchQuery = `${artistName} events ${location} concert show performance`;
    
    const params = {
      q: searchQuery,
      location: location,
      hl: "en",
      gl: "us",
      google_domain: "google.com",
    };

    const results = await new Promise((resolve, reject) => {
      client.json(params, (data) => {
        resolve(data);
      });
    });

    return parseEventResults(results, artistName);
  } catch (error) {
    console.error('SerpAPI error:', error);
    return [];
  }
};

export const searchSocialMedia = async (artistName, platform) => {
  try {
    const client = new SerpApi.GoogleSearch(SERPAPI_KEY);
    
    let searchQuery;
    switch(platform) {
      case 'instagram':
        searchQuery = `site:instagram.com ${artistName}`;
        break;
      case 'twitter':
        searchQuery = `site:twitter.com ${artistName} OR site:x.com ${artistName}`;
        break;
      case 'facebook':
        searchQuery = `site:facebook.com ${artistName} events`;
        break;
      case 'youtube':
        searchQuery = `site:youtube.com ${artistName}`;
        break;
      default:
        searchQuery = `${artistName} social media`;
    }

    const params = {
      q: searchQuery,
      num: 5,
    };

    const results = await new Promise((resolve, reject) => {
      client.json(params, (data) => {
        resolve(data);
      });
    });

    return parseSocialMediaResults(results);
  } catch (error) {
    console.error('Social media search error:', error);
    return [];
  }
};

const parseEventResults = (results, artistName) => {
  const events = [];
  
  if (results.organic_results) {
    results.organic_results.forEach(result => {
      const snippet = result.snippet || '';
      const title = result.title || '';
      
      // Look for date patterns in snippet and title
      const datePattern = /(\d{1,2}\/\d{1,2}\/\d{4}|\d{1,2}-\d{1,2}-\d{4}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{4})/gi;
      const dates = (snippet + ' ' + title).match(datePattern);
      
      // Look for venue/location info
      const venuePattern = /(at|@)\s+([A-Z][a-zA-Z\s&]+(?:venue|bar|club|hall|center|theatre|theater))/i;
      const venueMatch = (snippet + ' ' + title).match(venuePattern);
      
      if (dates || title.toLowerCase().includes('event') || title.toLowerCase().includes('concert')) {
        events.push({
          artist: artistName,
          title: title,
          date: dates ? dates[0] : 'TBA',
          venue: venueMatch ? venueMatch[2] : 'Venue TBA',
          description: snippet,
          link: result.link,
          source: 'web_search',
          createdAt: new Date().toISOString(),
        });
      }
    });
  }

  return events;
};

const parseSocialMediaResults = (results) => {
  const profiles = [];
  
  if (results.organic_results) {
    results.organic_results.forEach(result => {
      profiles.push({
        platform: detectPlatform(result.link),
        url: result.link,
        title: result.title,
        snippet: result.snippet,
      });
    });
  }

  return profiles;
};

const detectPlatform = (url) => {
  if (url.includes('instagram.com')) return 'Instagram';
  if (url.includes('twitter.com') || url.includes('x.com')) return 'Twitter/X';
  if (url.includes('facebook.com')) return 'Facebook';
  if (url.includes('youtube.com')) return 'YouTube';
  if (url.includes('tiktok.com')) return 'TikTok';
  return 'Other';
};