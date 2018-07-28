import React from 'react';
// 1: OSの判別のためにPlatformをインポートする
import {
  StyleSheet,
  Text,
  View,
  Platform,
} from 'react-native';
// 2: MapView、Location以外にもPermissionsとConstantsもインポートする
import {
  MapView,
  Permissions,
  Constants,
  Location,
} from 'expo'

export default class App extends React.Component {

  constructor(props) {
    super(props)
    // 3: MapViewを初期化するのに利用する座標と座標が取れていない時のメッセージを定義
    this.state = {
      latitude: null,
      longitude: null,
      message: "位置情報取得中",
    }
  }

  componentDidMount() {
    // 4: androidエミュレータでは動作しない
    if (Platform.OS === 'android' && !Constants.isDevice) {
      this.setState({
        message: 'Androidエミュレータでは動きません。実機で試してください。',
      })
    } else {
      this.getLocationAsync()
    }
  }

  // 5: 位置情報取得関数
  getLocationAsync = async () => {
    // 6: 位置情報のパーミッションを尋ねる。許可されないと動作しない仕組みにする
    const { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      this.setState({
        message: '位置情報のパーミッションの取得に失敗しました。',
      })
      return
    }
    // 7: 現在位置を取得
    const location = await Location.getCurrentPositionAsync({});
    this.setState({ latitude: location.coords.latitude, longitude: location.coords.longitude })
  }

  render() {
    // 8: 位置情報が取れていたらマップを表示
    if (this.state.latitude && this.state.longitude) {
      return (
        <View style={styles.container}>
          <MapView
            style={{flex: 1}}
            initialRegion={{
              latitude: this.state.latitude,
              longitude: this.state.longitude,
              latitudeDelta: 0.00922,
              longitudeDelta: 0.00521,
            }}
            showsUserLocation={true}
          />
        </View>
      )
    }
    // 9: 位置情報が取れない場合はメッセージを表示
    return (
      <View style={{flex: 1, justifyContent: 'center'}}>
        <Text>{this.state.message}</Text>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  // 10: コンテナのスタイルを変更
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'flex-start',
  },
});
