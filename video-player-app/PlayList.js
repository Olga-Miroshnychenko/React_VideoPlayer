import React from 'react';
import { Text, View, StyleSheet, TouchableHighlight } from 'react-native';
import { Actions } from 'react-native-router-flux';

class PlaylistItem {
    constructor(name, url) {
        this.name = name;
        this.url = url;

    }
}

const Playlist = [
    new PlaylistItem(
        'Film',
    ),
    new PlaylistItem(
        'News',
    ),
    new PlaylistItem(
        'Cartoon',
    ),
];


export default class Tab1 extends React.Component {

    Press = (index) => {
        Actions.jump('_player', { index: index });
    };


    render() {
        return (
            <View style={styles.container}>
                {
                    Playlist.map((item, index) => {
                        return (
                            <TouchableHighlight
                                key={index}
                                onPress={() => this.Press(index)}
                                underlayColor='#fff'
                            >
                                <Text style={styles.item}>{item.name}</Text>
                            </TouchableHighlight>
                        )
                    })
                }
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ADD8E6',
        alignItems: 'center',

    },
    item: {
        fontSize: 20,
        margin: 5,
    }
});