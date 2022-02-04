const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CompressionPlugin = require('compression-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const apiMocker = require('connect-api-mocker');
const path = require('path');
const glob = require('glob');
const startWsMock = require("./ws");

module.exports = (env, args) => {
	let production = false;

	if (args && args.mode === 'production') {
		production = true;
		// console.log('== Production mode');
	} else {
		console.log('== Development mode');
	}

	const plugins = [
		new MiniCssExtractPlugin(),

		new CopyWebpackPlugin({
			patterns: [{
				from: '**/*',
				context: './api-mocks/'
			}]
		})
	];
	const basePath = 'src/templates';
	glob.sync(`${basePath}/**/*.html`).forEach((item) => {
		plugins.push(
			new HtmlWebpackPlugin({
				filename: path.relative(basePath, item),
				template: item
			})
		)
	});
	if (production) {
		plugins.push(new BundleAnalyzerPlugin({
			analyzerMode: 'static'
		}));
		plugins.push(new CompressionPlugin());
	} else {
		plugins.push(new ForkTsCheckerWebpackPlugin());
	}


	return {
		entry: {
			'scripts/main': './src/index.tsx',
		},
		output: {
			filename: '[name].js',
			path: path.resolve('./dist'),
		},
		target: 'web',
		devtool: 'source-map',
		optimization: {
			usedExports: true,
			moduleIds: 'hashed',
			// runtimeChunk: 'single',
			splitChunks: {
				cacheGroups: {
					vendor: {
						test: /node_modules/,
						name: 'scripts/vendor',
						chunks: 'all',
						enforce: true,
					},
				},
			},
		},
		resolve: {
			mainFields: ['module', 'main'],
			extensions: ['.ts', '.tsx', '.js', '.html', '.txt']
		},
		module: {
			rules: [{
					test: /\.tsx?$/,
					use: [{
						loader: 'ts-loader'
					}],
				},
				{
					test: /\.css$/i,
					use: [
						MiniCssExtractPlugin.loader,
						"@teamsupercell/typings-for-css-modules-loader",
						{
							loader: "css-loader",
							options: {
								modules: true
							}
						}
					],
					exclude: /node_modules/
				},
				{
					test: /\.css$/i,
					include: /node_modules/,
					use: [
						MiniCssExtractPlugin.loader,
						"css-loader"
					]
				}
			],
		},
		devServer: {
			//before(app) {
			//	app.use(apiMocker('/api', 'api-mocks/api'));
			//	startWsMock();
			//},
			proxy: {
				'/api': 'http://192.168.1.69'
			},
			headers: {
				'Access-Control-Allow-Origin': '*'
			},
			contentBase: './dist',
			compress: true,
			host: '0.0.0.0',
			port: 3030
		},
		plugins,
		stats: 'errors-only',
		externals: {
			d3: 'window.d3',
			codemirror: 'window.CodeMirror',
			luaparse: 'window.luaparse'
		}

	};
};
