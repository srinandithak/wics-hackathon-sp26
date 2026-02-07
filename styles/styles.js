import { StyleSheet } from 'react-native';

// Shared discover screen palette & spacing
export const DiscoverColors = {
  white: '#f7efdc',
  orange: '#db775b',
  black: '#000000',
  placeholder: '#687076',
};

const padding = 20;
const paddingTop = 16;
const searchRadius = 75;
const listPaddingBottom = 32;

export const discoverStyles = StyleSheet.create({
  // Layout (same for Artists & Events)
  container: {
    flex: 1,
    padding,
    paddingTop,
    backgroundColor: DiscoverColors.white,
  },
  title: {
    fontSize: 50,
    paddingTop: 0,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 15,
    marginTop: 4,
    marginBottom: 16,
  },
  searchWrap: {
    borderRadius: searchRadius,
    alignSelf: 'stretch',
    backgroundColor: DiscoverColors.orange,
    marginTop: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    padding: 15,
    fontSize: 16,
    color: DiscoverColors.black,
  },
  searchIcon: {
    paddingRight: 16,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: listPaddingBottom,
  },
});
