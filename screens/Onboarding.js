import { Button, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';


export default function OnBoarding({ navigation }) {
  
    return (
        <View>
            <Text>Welcome to Music App</Text>
            <View>
              <View>
                <Button title="Login" onPress={() => navigation.navigate('Login')}></Button>
              </View>

              {/* <View style={{margin: 20, padding: 10, width: 450, height: 300}}>
                <Button 
                  title="Skip Login and Continue" 
                  onPress={() => {
                      navigation.navigate('Main'); 
                  }}
                />
              </View> */}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
   heading: {
     fontSize: 70,
     textAlign: 'center',
    //  fontFamily: 'OpenDyslexic'
   },
  image: {
    height: 150,
    width: 150
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 10,
    marginTop: 50
  },
  container2: {
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    margin: 20,
    marginTop: 40
  },
  logoLine: {
    width: 800,
    height: 15,
    backgroundColor: 'black',
    textAlign: 'center'
  }
          
});