import React from 'react';
import {
    Dimensions,
    StyleSheet,
    Text,
    TouchableHighlight,
    View,
    Button,
} from 'react-native';
import { Audio } from 'expo';
import { AntDesign } from '@expo/vector-icons';
import { Actions } from 'react-native-router-flux';
import { Video } from 'expo';

class PlaylistItem {
    constructor(name, uri) {
        this.name = name;
        this.uri = uri;
    }
}

const PLAYLIST = [
    new PlaylistItem(
        'Film',
        'https://d301468hdcm00e.cloudfront.net/5d1b000b0154f68c982de394cb32908a_video-file.mp4',

    ),
    new PlaylistItem(
        'News',
        'https://d301468hdcm00e.cloudfront.net/f923370a50dcb58550e79d7808d07b13_video-file.mp4',

    ),
    new PlaylistItem(
        'Cartoon',
        'https://d301468hdcm00e.cloudfront.net/5d1b000b0154f68c982de394cb32908a_video-file.mp4',

    ),
];

const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = Dimensions.get('window');
const BACKGROUND_COLOR = '#ADD8E6';
const DISABLED_OPACITY = 0.5;
const FONT_SIZE = 13;
const LOADING_STRING = 'Loading...';
const BUFFERING_STRING = 'Buffering...';

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.index = this.props.index;
        this.playbackInstance = null;
        this.state = {
            playbackInstanceName: LOADING_STRING,
            playbackInstancePosition: null,
            playbackInstanceDuration: null,
            shouldPlay: false,
            isPlaying: false,
            isBuffering: false,
            isLoading: true,
            fontLoaded: true,
            volume: 0.6,
            rate: 1.0,
            portrait: null,

        };
    }
    componentWillReceiveProps(props) {
        this.index = props.index;
        this._updateScreenForLoading(true);
        this._loadNewPlaybackInstance(true);
    }

    async _loadNewPlaybackInstance(playing) {
        if (this.playbackInstance != null) {
            await this.playbackInstance.unloadAsync();
            this.playbackInstance.setOnPlaybackStatusUpdate(null);
            this.playbackInstance = null;
        }

        const source = { uri: PLAYLIST[this.index].uri };
        const initialStatus = {
            shouldPlay: playing,
        };


        const { sound } = await Audio.Sound.createAsync(
            source,
            initialStatus,
            this._onPlaybackStatusUpdate
        );
        this.playbackInstance = sound;

        this._updateScreenForLoading(false);
    }

    _updateScreenForLoading(isLoading) {
        if (isLoading) {
            this.setState({
                isPlaying: false,
                playbackInstanceName: LOADING_STRING,
                playbackInstanceDuration: null,
                playbackInstancePosition: null,
                isLoading: true,
            });
        } else {
            this.setState({
                playbackInstanceName: PLAYLIST[this.index].name,
                isLoading: false,
            });
        }
    }

    _onPlaybackStatusUpdate = status => {
        if (status.isLoaded) {
            this.setState({
                playbackInstancePosition: status.positionMillis,
                playbackInstanceDuration: status.durationMillis,
                shouldPlay: status.shouldPlay,
                isPlaying: status.isPlaying,
                isBuffering: status.isBuffering,
                rate: status.rate,
                volume: status.volume,
            });
            if (status.didJustFinish) {
                this._advanceIndex(true);
                this._updatePlaybackInstanceForIndex(true);
            }
        } else {
            if (status.error) {
                console.log(`SOME PLAYER ERROR: ${status.error}`);
            }
        }
    };

    _advanceIndex(forward) {
        this.index =
            (this.index + (forward ? 1 : PLAYLIST.length - 1)) %
            PLAYLIST.length;
    }

    async _updatePlaybackInstanceForIndex(playing) {
        this._updateScreenForLoading(true);

        this._loadNewPlaybackInstance(playing);
    }

    _onPlayPausePressed = () => {
        if (this.playbackInstance != null) {
            if (this.state.isPlaying) {
                this.playbackInstance.pauseAsync();
            } else {
                this.playbackInstance.playAsync();
            }
        }
    };

    _onForwardPressed = () => {
        if (this.playbackInstance != null) {
            this._advanceIndex(true);
            this._updatePlaybackInstanceForIndex(this.state.shouldPlay);
        }
    };

    _onBackPressed = () => {
        if (this.playbackInstance != null) {
            this._advanceIndex(false);
            this._updatePlaybackInstanceForIndex(this.state.shouldPlay);
        }
    };


    _getMMSSFromMillis(millis) {
        const totalSeconds = millis / 1000;
        const seconds = Math.floor(totalSeconds % 60);
        const minutes = Math.floor(totalSeconds / 60);

        const padWithZero = number => {
            const string = number.toString();
            if (number < 10) {
                return '0' + string;
            }
            return string;
        };
        return padWithZero(minutes) + ':' + padWithZero(seconds);
    }

    _getTimestamp() {
        if (
            this.playbackInstance != null &&
            this.state.playbackInstancePosition != null &&
            this.state.playbackInstanceDuration != null
        ) {
            return `${this._getMMSSFromMillis(
                this.state.playbackInstancePosition
            )} / ${this._getMMSSFromMillis(
                this.state.playbackInstanceDuration
            )}`;
        }
        return '';
    }


    render() {
        return !this.state.fontLoaded ? (
            <View />
        ) : (
                <View style={styles.container}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <View style={{ margin: 30 }}>
                            <Button
                                onPress={() => Actions.jump('_playList')}
                                title="Back"
                                color="black"
                            />
                        </View>
                    </View>
                    <View style={styles.container}>
                        <View>
                            <Video
                                source={{ uri: PLAYLIST[this.index].uri }}
                                shouldPlay={this.state.shouldPlay}
                                resizeMode="cover"
                                style={{ width: 300, height: 350 }}
                            />
                        </View>
                    </View>
                    <View style={styles.detailsContainer}>
                        <Text>
                            {this.state.playbackInstanceName}
                        </Text>
                        <Text>
                            {this.state.isBuffering ? (
                                BUFFERING_STRING
                            ) : (
                                    this._getTimestamp()
                                )}
                        </Text>
                    </View>
                    <View
                        style={[
                            styles.buttonsContainerBase,
                            styles.buttonsContainerTopRow,
                            {
                                opacity: this.state.isLoading
                                    ? DISABLED_OPACITY
                                    : 1.0,
                            },
                        ]}
                    >
                        <TouchableHighlight
                            underlayColor={BACKGROUND_COLOR}
                            style={styles.wrapper}
                            onPress={this._onBackPressed}
                            disabled={this.state.isLoading}
                        >
                            <AntDesign name="stepbackward" size={35} />
                        </TouchableHighlight>
                        <TouchableHighlight
                            underlayColor={BACKGROUND_COLOR}
                            style={styles.wrapper}
                            onPress={this._onPlayPausePressed}
                            disabled={this.state.isLoading}
                        >
                            <View>
                                <AntDesign
                                    name={this.state.isPlaying ? 'pausecircle' : 'play'}
                                    size={40}
                                />
                            </View>
                        </TouchableHighlight>
                        <TouchableHighlight
                            underlayColor={BACKGROUND_COLOR}
                            style={styles.wrapper}
                            onPress={this._onForwardPressed}
                            disabled={this.state.isLoading}
                        >
                            <View>
                                <AntDesign name="stepforward" size={40} />
                            </View>
                        </TouchableHighlight>
                    </View>

                </View>
            );
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        alignSelf: 'stretch',
        backgroundColor: BACKGROUND_COLOR,
    },
    portraitContainer: {
        marginTop: 80,
    },
    portrait: {
        height: 200,
        width: 200,
    },
    detailsContainer: {
        height: 40,
        marginTop: 4,
        alignItems: 'center',
    },
    playbackContainer: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        alignSelf: 'stretch',
    },
    text: {
        fontSize: FONT_SIZE,
        minHeight: FONT_SIZE,
    },
    buttonsContainerBase: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 100,
    },
    buttonsContainerTopRow: {
        maxHeight: 40,
        minWidth: DEVICE_WIDTH / 2.0,
        maxWidth: DEVICE_WIDTH / 2.0,
    },
    buttonsContainerMiddleRow: {
        maxHeight: 40,
        alignSelf: 'stretch',
        paddingRight: 20,
    },
    buttonsContainerBottomRow: {
        alignSelf: 'stretch',
    },
});
