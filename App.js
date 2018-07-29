import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Platform,
  TouchableOpacity, // 1: TouchableOpacityを追加
} from 'react-native';
import {
  MapView,
  Permissions,
  Constants,
  Location,
} from 'expo'

export default class App extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      latitude: null,
      longitude: null,
      message: "位置情報取得中",
      logs: [], // 2: GPSログを格納する領域
      subscription: null, // 3: 位置情報の監視のID
      status: 'stop', // 4: ログを取得中か停止しているか
    }
  }

  componentDidMount() {
    if (Platform.OS === 'android' && !Constants.isDevice) {
      this.setState({
        message: 'Androidエミュレータでは動きません。実機で試してください。',
      })
    } else {
      this.getLocationAsync()
    }
  }

  getLocationAsync = async () => {
    const { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      this.setState({
        message: '位置情報のパーミッションの取得に失敗しました。',
      })
      return
    }
    const location = await Location.getCurrentPositionAsync({});
    this.setState({ latitude: location.coords.latitude, longitude: location.coords.longitude })
  }

  // 5: GPSログの取得を開始する関数
  startLogging = async () => {
    if (this.state.subscription) {
      return
    }
    this.setState({logs: []})
    const subscription = await Location.watchPositionAsync({enableHighAccuracy: true, distanceInterval: 5 }, this.loggingPosition)
    this.setState({ subscription: subscription, status: 'logging'})
  }

  // 6: GPSログの取得を停止する関数
  stopLogging = () => {
    if (this.state.subscription) {
      this.state.subscription.remove(this.loggingPosition)
    }
    this.setState({ subscription: null, status: 'stop' })
  }

  // 7: Location.watchPositionAsyncのコールバック関数
  loggingPosition = ({coords, timestamp}) => {
    if (coords.accuracy) {
      // 8: stateに追加するため必ず配列は新しいものを作成する
      let logs = [...this.state.logs]
      logs.push({latitude: coords.latitude, longitude: coords.longitude})
      this.setState({logs: logs})
    }
  }

  // 9: ログをメールで送るための関数。まだ未実装
  sendEmail = () => {
  }

  render() {
    if (this.state.latitude && this.state.longitude) {
      return (
        <View style={styles.container}>
          { /* 10: ボタンを配置 */ }
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={this.startLogging}>
              <Text>Start</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={this.stopLogging}>
              <Text>Stop</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={this.sendEmail}>
              <Text>Email</Text>
            </TouchableOpacity>
          </View>
          <MapView
            style={{flex: 1}}
            initialRegion={{
              latitude: this.state.latitude,
              longitude: this.state.longitude,
              latitudeDelta: 0.00922,
              longitudeDelta: 0.00521,
            }}
            showsUserLocation={true}
          >
            {
              // 11: ログが二個以上あれば画面上に線として描画
              this.state.logs.length > 1 ?
                <MapView.Polyline
                  coordinates={this.state.logs}
                  strokeColor="#00008b"
                  strokeWidth={6}
                />
                : null
            }
          </MapView>
        </View>
      )
    }
    return (
      <View style={{flex: 1, justifyContent: 'center'}}>
        <Text>{this.state.message}</Text>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'flex-start',
  },
  // 12: ボタンの配置用のスタイルを追加
  buttonContainer: {
    height: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
});
