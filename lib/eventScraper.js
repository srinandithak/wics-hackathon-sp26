import { supabase } from './supabase';
import { searchArtistEvents, searchSocialMedia } from './serpapi';

export const scrapeArtistEvents = async (artistId, artistName) => {
    try {
        console.log(`Scraping events for ${artistName}...`);

        // Search for events
        const events = await searchArtistEvents(artistName, 'Austin, Texas');

        // Search social media for additional info
        const socialProfiles = await Promise.all([
            searchSocialMedia(artistName, 'instagram'),
            searchSocialMedia(artistName, 'twitter'),
            searchSocialMedia(artistName, 'facebook'),
        ]);

        // Store events in Supabase
        const eventsToStore = events.map(event => ({
            title: event.title,
            description: event.description,
            date_time: event.date,
            location: event.venue || 'Austin, TX',
            venue_type: 'scraped',
            created_by: artistId,
            artist_ids: [artistId],
            image_url: null,
        }));

        if (eventsToStore.length > 0) {
            const { data, error } = await supabase
                .from('events')
                .insert(eventsToStore);

            if (error) {
                console.error('Error storing events:', error);
            } else {
                console.log(`Stored ${eventsToStore.length} events for ${artistName}`);
            }
        }

        // Store social media profiles in the artist's profile
        const flatProfiles = socialProfiles.flat();
        if (flatProfiles.length > 0) {
            // Convert array to object for easier access
            const socialMediaObj = flatProfiles.reduce((acc, profile) => {
                acc[profile.platform.toLowerCase()] = {
                    url: profile.url,
                    title: profile.title
                };
                return acc;
            }, {});

            const { error: socialError } = await supabase
                .from('profiles')
                .update({ social_media: socialMediaObj })
                .eq('id', artistId);

            if (socialError) {
                console.error('Error storing social profiles:', socialError);
            }
        }

        return {
            events: eventsToStore,
            socialProfiles: flatProfiles,
        };
    } catch (error) {
        console.error('Error in scrapeArtistEvents:', error);
        return { events: [], socialProfiles: [] };
    }
};

// Function to scrape all artists periodically
export const scrapeAllArtists = async () => {
    try {
        const { data: artists, error } = await supabase
            .from('profiles')
            .select('id, name')
            .eq('user_type', 'artist');

        if (error) {
            console.error('Error fetching artists:', error);
            return;
        }

        for (const artist of artists) {
            await scrapeArtistEvents(artist.id, artist.name);
            // Add delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        console.log('Finished scraping all artists');
    } catch (error) {
        console.error('Error in scrapeAllArtists:', error);
    }
};