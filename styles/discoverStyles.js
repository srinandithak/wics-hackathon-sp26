import { StyleSheet } from 'react-native';

export const DiscoverColors = {
  white: '#f7efdc',
  orange: '#db775b',
  black: '#000000',
};

const discoverStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 70,
    backgroundColor: DiscoverColors.white,
  },
  title: {
    fontSize: 50,
    paddingTop: 20,
    fontWeight: '600',
  },
  searchWrap: {
    borderRadius: 75,
    width: 350,
    backgroundColor: DiscoverColors.orange,
    marginTop: 16,
    marginBottom: 16,
  },
  searchInput: {
    padding: 15,
    color: DiscoverColors.black,
    fontSize: 16,
  },
});

export default discoverStyles;
