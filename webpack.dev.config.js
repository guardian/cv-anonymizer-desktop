const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { spawn } = require('child_process');

// Any directories you will be adding code/files into, need to be added to this array so webpack will pick them up
const defaultInclude = path.resolve(__dirname, 'src');

console.log(path.resolve(__dirname, 'src'));

module.exports = {
	resolve: {
		modules: [path.resolve(__dirname, 'src'), 'node_modules'],
	},
	module: {
		rules: [
			{
				test: /\.css$/, // loader CSS
				use: [
					{ loader: 'style-loader' },
					{ loader: 'css-loader?modules' },
					{ loader: 'postcss-loader' },
				],
				include: defaultInclude,
			},
			{
				test: /\.jsx?$/, // loader for react
				use: [{ loader: 'babel-loader' }],
				include: defaultInclude,
			},
			{
				test: /\.(jpe?g|png|gif)$/, // loader for images
				use: [{ loader: 'file-loader?name=img/[name]__[hash:base64:5].[ext]' }],
				include: defaultInclude,
			},
			{
				test: /\.(eot|svg|ttf|woff|woff2)$/, // loader for custom fonts
				use: [
					{ loader: 'file-loader?name=font/[name]__[hash:base64:5].[ext]' },
				],
				include: defaultInclude,
			},
		],
	},
	target: 'electron-renderer',
	plugins: [
		new HtmlWebpackPlugin({
			template: 'public/index.html',
		}),
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify('development'),
		}),
	],
	devtool: 'cheap-source-map',
	devServer: {
		contentBase: path.resolve(__dirname, 'dist'),
		stats: {
			colors: true,
			chunks: false,
			children: false,
		},
		before() {
			spawn('electron', ['.'], {
				shell: true,
				env: process.env,
				stdio: 'inherit',
			})
				.on('close', code => process.exit(0))
				.on('error', spawnError => console.error(spawnError));
		},
	},
};
