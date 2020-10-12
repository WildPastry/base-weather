// imports
import React, { Component } from 'react';
import {
	Alert,
	Animated,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from 'react-native-elements';
import Help from '../screens/Help';
import colours from './../assets/colours.json';
import LottieView from 'lottie-react-native';
import timeout from './../data/timeout.js';

// firebase
import * as firebase from 'firebase';
import { withFirebaseHOC } from '../config/Firebase';
import 'firebase/firestore';
import 'firebase/auth';

// create animated view
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

// run timeout function
{
	timeout;
}

// START Header
class Header extends Component {
	constructor() {
		super();
		this.state = {
			progress: false,
			showMenu: false,
			home: [],
			savedLocations: [],
		};
		this.handleHome = this.handleHome.bind(this);
		this.handleDelete = this.handleDelete.bind(this);
		this.updateSkyData = this.updateSkyData.bind(this);
		this.handleAnimate = this.handleAnimate.bind(this);
		this.handleLocationAlert = this.handleLocationAlert.bind(this);
	}

	// START component mounted
	componentDidMount = async () => {
		let isMounted = true;
		if (isMounted) {
			console.log(this.state, 'From componentDidMount in Header');
			// check firebase for user
			var user = firebase.auth().currentUser;
			if (user) {
				// user is signed in
				// load firebase data
				const db = firebase.firestore();
				const dbRT = firebase.database();
				const ref = dbRT.ref(user.uid);
				// const homeRef = ref.child('home');
				const locationRef = ref.child('locations');
				const docRef = db.collection('users').doc(user.uid);
				// check if the signed in user has data saved
				docRef
					.get()
					.then(function (doc) {
						if (doc.exists) {
							console.log(
								'User',
								doc.data().name,
								'is logged in, From componentDidMount in Header.js'
							);
						} else {
							console.log('No docs exist...');
						}
					})
					.catch(function (error) {
						console.log('Error getting document:', error);
					});
				// get signed in users saved data on load
				locationRef.once('value', (snapshot) => {
					if (snapshot.exists()) {
						let data = snapshot.val();
						let locations = Object.values(data);
						this.setState({ savedLocations: locations }, () => {
							console.log('Locations loaded in Header.js...');
							console.log(this.state.savedLocations);
							this.checkHome();
						});
					} else {
						// if they have no locations saved set state to null
						this.setState({
							savedLocations: '',
						});
					}
				});
				// no user
				console.log('No user is currently logged in...');
			}
		}
		return () => (isMounted = false);
	};
	// END component mounted

	// update sky data function
	updateSkyData(val) {
		let mounted = true;
		if (mounted) {
			console.log(val, 'From updateSkyData in Header.js');
			var options = {
				googleLat: val[0],
				googleLng: val[1],
				googleName: val[2],
			};
			this.props.updateSkyData(options);
		}
		return () => (mounted = false);
	}

	// handle signout
	handleSignout = async () => {
		try {
			await this.props.firebase.signOut();
			this.props.navigation.navigate('Auth');
			console.log('User has been signed out...');
		} catch (error) {
			console.log(error);
		}
	};

	// handle login
	handleLogin = () => this.props.navigation.navigate('Login');

	// handle signup
	handleSignup = () => this.props.navigation.navigate('Signup');

	// check home value
	checkHome = () => {
		let isMounted = true;
		if (isMounted) {
			console.log('Inside checkHome from Header.js...');
			// set temporary array to check for a saved home location
			var checkHome = this.state.savedLocations;
			// check firebase for user
			var user = firebase.auth().currentUser;
			if (user) {
				// user is signed in
				// load firebase data
				const db = firebase.firestore(),
					dbRT = firebase.database(),
					ref = dbRT.ref(user.uid),
					homeRef = ref.child('home');
				var docRef = db.collection('users').doc(user.uid);
				// check if the signed in user has data saved
				docRef
					.get()
					.then(function (doc) {
						if (doc.exists) {
							console.log(
								'User',
								doc.data().name,
								'is logged in, From checkHome in Header.js'
							);
						} else {
							console.log('No docs exist...');
						}
					})
					.catch(function (error) {
						console.log('Error getting document:', error);
					});
				// get signed in users saved data on load
				homeRef.once('value', (snapshot) => {
					if (snapshot.exists()) {
						let home = snapshot.val();
						// set the home location as the conditions to check the array
						const conditions = [home.location];
						// loop through and check each value
						Array.from(checkHome).forEach((arg) => {
							var checkVal = conditions.some((e) => arg.location.includes(e));
							arg.icon = checkVal;
						});
						console.log(checkHome, 'From checkHome in Header.js');
						// Save the new array to display the locations
						this.setState({ home: checkHome });
					} else {
						console.log('No home saved...from checkHome in Header.js');
						this.setState({
							home: checkHome,
						});
					}
				});
				// no user
			} else {
				console.log('No user is currently logged in...');
			}
		}
		return () => (isMounted = false);
	};

	// handle delete
	handleDelete(val) {
		var user = firebase.auth().currentUser;
		const dbRT = firebase.database();
		let isMounted = true;
		if (isMounted) {
			var options = {
				currentID: val[0],
				currentIcon: val[1],
			};
			console.log(options.currentID, 'From handleDelete in Header.js');
			dbRT.ref(user.uid + '/locations/' + options.currentID).remove();
			// load firebase data
			const db = firebase.firestore();
			const ref = dbRT.ref(user.uid);
			// const homeRef = ref.child('home');
			const locationRef = ref.child('locations');
			const docRef = db.collection('users').doc(user.uid);
			// check if the signed in user has data saved
			docRef
				.get()
				.then(function (doc) {
					if (doc.exists) {
						console.log(
							'User',
							doc.data().name,
							'is logged in, From handleDelete in Header.js'
						);
					} else {
						console.log('No docs exist...');
					}
				})
				.catch(function (error) {
					console.log('Error getting document:', error);
				});
			// get signed in users saved data on load
			locationRef.once('value', (snapshot) => {
				if (snapshot.exists()) {
					let data = snapshot.val();
					let locations = Object.values(data);
					this.setState({ savedLocations: locations }, () => {
						console.log('Locations loaded in Header.js...');
						console.log(this.state.savedLocations);
						this.checkHome();
					});
				} else {
					// if they have no locations saved set state to null
					this.setState({
						savedLocations: '',
					});
				}
			});
		}
		return () => (isMounted = false);
	}

	// handle home
	handleHome(val) {
		let isMounted = true;
		if (isMounted) {
			console.log('Inside handleHome from Header.js...');
			var options = {
				currentSavedLat: val[0],
				currentSavedLng: val[1],
				currentSavedName: val[2],
			};
			// set temporary array to check for a saved home location
			var checkHome = this.state.savedLocations;
			// check firebase for user
			var user = firebase.auth().currentUser;
			if (user) {
				console.log('User ID:', user.uid);
				console.log('User email:', user.providerData[0].email);
				// user is signed in
				// load firebase data
				const db = firebase.firestore(),
					dbRT = firebase.database(),
					ref = dbRT.ref(user.uid),
					homeRef = ref.child('home');
				var docRef = db.collection('users').doc(user.uid);
				console.log(this.state.savedLocations.length, 'locations saved...');
				// save home location
				dbRT.ref(user.uid + '/home').set(
					{
						lat: options.currentSavedLat,
						lng: options.currentSavedLng,
						location: options.currentSavedName,
					},
					function (error) {
						if (error) {
							console.log(error);
						} else {
							// no error and user is signed in so:
							console.log('Home location saved...');
							console.log(options.currentSavedName);
						}
					}
				);
				// check if the signed in user has data saved
				docRef
					.get()
					.then(function (doc) {
						if (doc.exists) {
							console.log(
								'User',
								doc.data().name,
								'is logged in, From handleHome in Header.js'
							);
						} else {
							console.log('No docs exist...');
						}
					})
					.catch(function (error) {
						console.log('Error getting document:', error);
					});
				// get signed in users saved data on load
				homeRef.once('value', (snapshot) => {
					if (snapshot.exists()) {
						let home = snapshot.val();
						// set the home location as the conditions to check the array
						const conditions = [home.location];
						// loop through and check each value
						Array.from(checkHome).forEach((arg) => {
							var checkVal = conditions.some((e) => arg.location.includes(e));
							arg.icon = checkVal;
							console.log(checkVal);
						});
						console.log(checkHome, 'From handleHome in Header.js');
						// Save the new array to display the locations
						this.setState({ home: checkHome });
					} else {
						console.log('No home saved...from handleHome in Header.js');
						this.setState({
							home: checkHome,
						});
					}
				});
			} else {
				// no user is signed in
				console.log('No user is logged in to save details...');
			}
		}
		return () => (isMounted = false);
	}
	
	// handle removal
	handleRemoval = () => {
		let isMounted = true;
		if (isMounted) {
			console.log('Inside handleRemoval from Header.js...');
			// Alert
			Alert.alert(
				'Are you sure?',
				'Once you confirm, your account will be removed',
				[
					{ text: 'Cancel', style: 'cancel' },
					{ text: 'Confirm', style: 'cancel' },
				],
				{ cancelable: false }
			);
		}
		return () => (isMounted = false);
	};

	// handle home alert
	handleHomeAlert = (val) => {
		let isMounted = true;
		if (isMounted) {
			console.log('Inside handleHomeAlert from Header.js...');
			console.log('Value is: ', val, 'from handleHomeAlert in Header.js...');
			// Alert
			Alert.alert(
				'Set Location as Home',
				'Are you sure you want to set this location to home?',
				[
					{ text: 'No', style: 'cancel' },
					{ text: 'Yes', onPress: () => this.handleHome(val) },
				],
				{ cancelable: false }
			);
		}
		return () => (isMounted = false);
	};

	// handle location alert
	handleLocationAlert = (val) => {
		let isMounted = true;
		if (isMounted) {
			console.log('Inside handleLocationAlert from Header.js...');
			console.log(
				'Value is: ',
				val,
				'from handleLocationAlert in Header.js...'
			);
			var options = {
				currentID: val[0],
				currentIcon: val[1],
			};
			if (options.currentIcon == true) {
				// Alert 1
				Alert.alert(
					'Location is set to Home',
					'Set another location to home to remove this location.',
					[{ text: 'Confirm', style: 'cancel' }],
					{ cancelable: false }
				);
			} else {
				// Alert 2
				Alert.alert(
					'Remove Location',
					'Are you sure you want to remove this saved location?',
					[
						{ text: 'No', style: 'cancel' },
						{ text: 'Yes', onPress: () => this.handleDelete(val) },
					],
					{ cancelable: false }
				);
			}
		}
		return () => (isMounted = false);
	};

	// handle login alert
	handleLoginAlert = () => {
		let isMounted = true;
		if (isMounted) {
			console.log('Inside handleLoginAlert from Header.js...');
			// Alert
			Alert.alert(
				'Not Logged In',
				'Please login or signup to save locations',
				[
					{ text: 'Cancel', style: 'cancel' },
					{ text: 'Login', onPress: this.handleLogin },
					{ text: 'Signup', onPress: this.handleSignup },
				],
				{ cancelable: false }
			);
		}
		return () => (isMounted = false);
	};

	// handle animation
	handleAnimate = () => {
		let mounted = true;
		if (mounted) {
			console.log('Inside handleAnimate from Header.js...');
			if (this.state.progress === false) {
				this.animation.play(20, 80);
				this.setState({
					progress: true,
					showMenu: true,
				});
			} else {
				console.log('Inside handleAnimate from Header.js...');
				this.animation.play(110, 150);
				this.setState({
					progress: false,
					showMenu: false,
				});
			}
		}
		return () => (mounted = false);
	};

	// Menu options
	renderMenuOption() {
		// Change menu based on user status
		let menuDisplay;
		// load firebase data
		var user = firebase.auth().currentUser;
		if (user) {
			console.log(
				'Current signed in user email:  ' + user.providerData[0].email
			);
			menuDisplay = (
				<View>
					<Button
						title='Signout'
						onPress={this.handleSignout}
						titleStyle={headerStyles.menuTitleBlue}
						type='clear'
					/>
					<View style={headerStyles.border} />
					<Help navigation={this.props.navigation} />
				</View>
			);
		} else {
			console.log('No user is logged in...');
			menuDisplay = (
				<View>
					<Button
						title='Login to the app'
						onPress={this.handleLogin}
						titleStyle={headerStyles.menuTitleGreen}
						type='clear'
					/>
					<View style={headerStyles.border} />
					<Button
						title='Sign up for an account'
						onPress={this.handleSignup}
						titleStyle={headerStyles.menuTitleBlue}
						type='clear'
					/>
					<View style={headerStyles.border} />
					<Help navigation={this.props.navigation} />
				</View>
			);
		}
		return menuDisplay;
	}

	// START render Header
	render() {
		console.log('Inside render from Header.js...');
		return (
			// master wrap
			<View>				
				{/* header wrap */}
				<View style={headerStyles.headerWrap}>
					{/* hamburger */}
					<AnimatedTouchable
						onPress={this.handleAnimate}
						style={{
							height: 35,
							width: 35,
						}}>
						<LottieView
							ref={(animation) => {
								this.animation = animation;
							}}
							source={require('./../assets/animations/hamburger.json')}
							loop={false}
						/>
					</AnimatedTouchable>
					{/* brand wrap */}
					<View style={{ flexDirection: 'row' }}>
						{/* brand text */}
						<Text style={headerStyles.simpleWeather}>SIMPLE WEATHER</Text>
					</View>
					{/* right icon for balance */}
					<View
						style={{
							backgroundColor: colours.spotGreyMed,
							height: 35,
							width: 35,
						}}
					/>
				</View>
				{/* menu */}
				{this.state.showMenu && (
					<View style={headerStyles.menuWrap}>
						{/* render menu based on user status */}
						<View style={headerStyles.border}>{this.renderMenuOption()}</View>
						{/* saved locations list */}
						<View style={headerStyles.listWrap}>
							<View style={headerStyles.listItems}>
								{this.state.savedLocations.length > 0 ? (
									<View>
										{this.state.home.map((location, index) => {
											return (
												<View
													style={savedLocationStyles.locationListWrapper}
													key={index}>
													<Text
														onPress={this.updateSkyData.bind(this, [
															location.lat,
															location.lng,
															location.location,
														])}
														style={savedLocationStyles.locationListText}>
														{location.location}
													</Text>
													<View style={savedLocationStyles.locationIconWrapper}>
														{/* home icon */}
														{location.icon ? (
															<Ionicons
																style={{ marginRight: 15 }}
																name='ios-home'
																size={30}
																color={colours.spotGreen}
															/>
														) : (
															<Ionicons
																style={{ marginRight: 15 }}
																name='ios-home'
																size={30}
																color={colours.spotGrey}
																onPress={this.handleHomeAlert.bind(this, [
																	location.lat,
																	location.lng,
																	location.location,
																])}
															/>
														)}
														{/* remove location icon */}
														<Ionicons
															onPress={this.handleLocationAlert.bind(this, [
																location.key,
																location.icon,
															])}
															name='ios-close-circle'
															size={30}
															color={colours.white}
														/>
													</View>
												</View>
											);
										})}
									</View>
								) : (
									<View>
										<Text
											style={savedLocationStyles.menuTextYellow}
											onPress={this.handleLoginAlert}>
											No saved locations
										</Text>
									</View>
								)}
							</View>
						</View>
					</View>
				)}
			</View>
		);
	}
	// END render Header
}
// END Header

export default withFirebaseHOC(Header);

// style
const headerStyles = StyleSheet.create({
	flex: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
	},
	menuWrap: {
		backgroundColor: colours.spotGreyDark,
		borderBottomColor: colours.spotGrey,
		borderBottomWidth: 1,
	},
	listWrap: {
		backgroundColor: colours.spotGreyDark,
	},
	listItems: {
		paddingTop: 4,
		paddingBottom: 4,
	},
	menuTitleWhite: {
		color: colours.spotWhite,
		fontSize: 18,
		fontFamily: 'allerLt',
		textAlign: 'center',
		padding: 8,
	},
	menuTitleYellow: {
		color: colours.spotYellow,
		fontSize: 18,
		fontFamily: 'allerLt',
		textAlign: 'center',
		padding: 8,
	},
	menuTitleBlue: {
		color: colours.spotBlue,
		fontSize: 18,
		fontFamily: 'allerLt',
		textAlign: 'center',
		padding: 8,
	},
	menuTitleGreen: {
		color: colours.spotGreen,
		fontSize: 18,
		fontFamily: 'allerLt',
		textAlign: 'center',
		padding: 8,
	},
	menuTitleRed: {
		color: colours.spotRed,
		fontSize: 18,
		fontFamily: 'allerLt',
		textAlign: 'center',
		padding: 8,
	},
	border: {
		borderBottomColor: colours.spotGrey,
		borderBottomWidth: 1,
	},
	simpleWeather: {
		color: colours.white,
		fontSize: 22,
		fontFamily: 'allerDisplay',
		textAlign: 'center',
		paddingTop: 4,
	},
	headerWrap: {
		paddingRight: 5,
		paddingLeft: 5,
		paddingBottom: 10,
		paddingTop: 10,
		flexDirection: 'row',
		justifyContent: 'space-between',
		backgroundColor: colours.spotGreyMed,
		borderBottomColor: colours.spotGrey,
		borderBottomWidth: 1,
	},
});

// style
const savedLocationStyles = StyleSheet.create({
	locationListWrapper: {
		alignItems: 'center',
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingLeft: 8,
		paddingRight: 8,
	},
	locationListText: {
		fontSize: 18,
		fontFamily: 'allerLt',
		color: colours.white,
		padding: 9,
		marginBottom: 3,
	},
	locationIconWrapper: {
		alignItems: 'flex-end',
		flexDirection: 'row',
	},
	menuTextYellow: {
		color: colours.spotYellow,
		fontSize: 18,
		fontFamily: 'allerLt',
		textAlign: 'center',
		paddingRight: 8,
		paddingLeft: 8,
		paddingBottom: 10,
		paddingTop: 10,
	},
});
