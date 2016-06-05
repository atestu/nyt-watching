/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import moment from 'moment';
import {
	AppRegistry,
	StyleSheet,
	Text,
	Image,
	ListView,
	WebView,
	Linking,
	TouchableHighlight,
	View
} from 'react-native';

var REQUEST_URL = 'https://int.nyt.com/applications/portal/data/v3/streams.json';

class NYTFeed extends Component {
	constructor(props) {
		super(props)
		this.state = {
      dataSource: new ListView.DataSource({
        rowHasChanged: (row1, row2) => row1 !== row2,
      }),
      loaded: false,
		}
	}

	componentDidMount() {
    this.fetchData();
  }

	fetchData() {
    fetch(REQUEST_URL)
      .then(response => response.json())
      .then(data => {
        this.setState({
					dataSource: this.state.dataSource.cloneWithRows(data.streams[0].clusters),
          loaded: true
        });
      })
      .done();
  }

	render() {
    if (!this.state.loaded) {
      return this.renderLoadingView();
    }

		return <ListView
        dataSource={this.state.dataSource}
        renderRow={this.renderStory.bind(this)}
        style={styles.listView}
				initialListSize={this.state.dataSource.rowIdentities[0].length}
      />
  }

  renderLoadingView() {
    return (
      <View style={[styles.container, styles.containerColumn]}>
        <Text style={{paddingTop: 200, alignSelf: 'center'}}>
          Loading stories...
        </Text>
      </View>
    );
  }

	getText(summary) {
		var boldTexts = summary.match(/<b>([^<]*)<\/b>/ig);
		var texts = [];

		if (!boldTexts)
			return summary;

		var i = 0;
		boldTexts.forEach(boldText => {
			var index = summary.indexOf(boldText);
			texts.push(<Text>{summary.slice(i, index)}</Text>);
			texts.push(<Text style={{fontWeight: 'bold'}}>{boldText.slice(3, boldText.length-4)}</Text>);
			i = index+boldText.length;
		});

		if (i != summary.length)
			texts.push(<Text>{summary.slice(i, summary.length)}</Text>);

		return texts
	}

  renderStory(story) {
		var thumbnailStyle = story.posts[0].display_asset_style;
		var image = <View></View>;
		var viewStyles = [styles.container];

		if (thumbnailStyle && story.posts[0].display_asset) {
			if (thumbnailStyle == 'thumb_square') {
				thumbnailStyle = 'thumbLarge';
				viewStyles.push(styles.containerRow);
			}
			else {
				thumbnailStyle = 'videoLarge';
				viewStyles.push(styles.containerColumn);
			}

			if (story.posts[0].display_asset.crops[thumbnailStyle])
				image = <Image
					source={{uri: story.posts[0].display_asset.crops[thumbnailStyle].url}}
					style={{
						height: story.posts[0].display_asset.crops[thumbnailStyle].height/2,
						width: story.posts[0].display_asset.crops[thumbnailStyle].width/2,
						margin: thumbnailStyle === 'thumbLarge' ? 7 : 0,
					}}
				/>
		}

		var textView = <View style={{
			flex: 1,
			margin: 7,
		}}>
			<Text>{this.getText(story.posts[0].summaries[0].body)}</Text>
			<Text style={{color: '#999'}}>{moment(story.posts[0].date_updated*1000).fromNow()}</Text>
		</View>

    return (
			<TouchableHighlight activeOpacity={0.5} underlayColor={'white'} onPress={() => Linking.openURL(story.posts[0].asset.url)}>
	      <View style={viewStyles}>
					{thumbnailStyle === 'thumbLarge' ? [textView, image] : [image, textView]}
	      </View>
			</TouchableHighlight>
    );
  }
}

const styles = StyleSheet.create({
	container: {
		borderTopWidth: 1,
		borderStyle: 'solid',
		borderColor: '#eee',
	},
	containerRow: {
		flexDirection: 'row',
	},
	containerColumn: {
		flexDirection: 'column',
	},
  listView: {
    paddingTop: 20,
  }
});

AppRegistry.registerComponent('NYTFeed', () => NYTFeed);
