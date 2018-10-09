import React, { Component } from 'react';
import styles from './index.css';
import { Button } from '../Button/index';
import { ResumeWrap } from './ResumeWrap/index';
import { ListWrap } from '../Section/ListWrap/index';
import { HelpTextWrap } from '../Section/HelpTextWrap/index';

export class ResumeWrapList extends Component {
	render() {
		return (
			<form onSubmit={e => this.props.onSubmit(e)} className={styles.root}>
				<div className={styles.content}>
					<ListWrap>
						{this.props.resumes.map(resume => (
							<div>
								<ResumeWrap
									key={resume.fileName}
									fileName={resume.fileName}
									redactedFileName={resume.redactedFileName}
									baseFileName={resume.baseFileName}
									onNameChange={name => resume.setName(name)}
								/>
								<HelpTextWrap>
									A new file, {resume.redactedFileName}
									.redacted.pdf will be saved alongside the original, blocking
									out the name you provided as well as emails and urls
								</HelpTextWrap>
							</div>
						))}
						<Button type="submit">Redact</Button>
					</ListWrap>
				</div>
				<Button secondary onClick={e => this.props.onClear(e)}>
					Choose a different resume
				</Button>
			</form>
		);
	}
}