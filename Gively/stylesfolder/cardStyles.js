import { StyleSheet } from 'react-native';

export const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#5A5A5A',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  profileImage: {
    width: 64,
    height: 64,
    borderRadius: 10,
    marginRight: 10,
  },
  posterInfo: {
    flex: 1,
  },
  posterName: {
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
  },
  posterDate: {
    fontSize: 13,
    color: '#1C5AA3',
    paddingTop: 5,
    fontFamily: 'Montserrat-Medium',
  },
  postText: {
    fontSize: 14,
    marginBottom: 10,
    lineHeight: 24,
    fontFamily: 'Montserrat-Medium',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: '#3FC032',
    borderRadius: 7,
    padding: 10,
    paddingHorizontal: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    fontFamily: 'Montserrat-Bold',
  },
});