import React, { Component } from 'react';
import { connect } from 'react-redux';
import { onDrop } from './lib/ipc-events';
import { DropZone } from 'views/DropZone/DropZone';
import { Resumes } from 'views/Resumes/Resumes';

class PreApp extends Component {
	render() {
		const { resumes } = this.props;
		return resumes.length === 0 ? <DropZone /> : <Resumes onDrop={onDrop} />;
	}
}

export const App = connect(state => ({
	resumes: state.cv,
}))(PreApp);
