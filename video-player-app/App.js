import React from 'react';
import { StyleSheet } from 'react-native';
import { Scene, Router } from 'react-native-router-flux';
import PlayList from './PlayList';
import Player from './Player';



export default class App extends React.Component {
    render() {
        return (
            <Router style={styles.container}>
                <Scene key="root" tabs={true} tabBarPosition="bottom">
                    <Scene key="playList" component={PlayList} title="Playlist" />
                    <Scene
                        key="player"
                        component={Player}
                        hideNavBar={true}
                        title='Player'
                    />
                </Scene>
            </Router>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
