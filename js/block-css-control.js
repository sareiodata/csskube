(function() {
	const { addFilter } = wp.hooks;
	const { Fragment, useEffect, useRef } = wp.element;
	const { InspectorControls } = wp.blockEditor;
	const { PanelBody, TextareaControl, TabPanel } = wp.components;
	const { createHigherOrderComponent } = wp.compose;

	/**
	 * Add custom CSS attribute to all blocks
	 */
	function addCSSAttribute(settings) {
		// Skip core/freeform blocks and other non-standard blocks
		if (typeof settings.attributes !== 'undefined') {
			settings.attributes = Object.assign(settings.attributes, {
				cssKubeCSS_all: {
					type: 'string',
					default: ''
				},
				cssKubeCSS_mobile: {
					type: 'string',
					default: ''
				},
				cssKubeCSS_tablet: {
					type: 'string',
					default: ''
				},
				cssKubeCSS_desktop: {
					type: 'string',
					default: ''
				}
			});
		}

		return settings;
	}

	addFilter(
		'blocks.registerBlockType',
		'csskube/add-css-attribute',
		addCSSAttribute
	);

	/**
	 * Create HOC to add CSS control to BlockEdit
	 */
	const withCSSControl = createHigherOrderComponent((BlockEdit) => {
		return (props) => {
			const { attributes, setAttributes, isSelected } = props;
			const { cssKubeCSS_all, cssKubeCSS_mobile, cssKubeCSS_tablet, cssKubeCSS_desktop } = attributes;

			return (
				wp.element.createElement(
					Fragment,
					null,
					wp.element.createElement(BlockEdit, props),
					isSelected && wp.element.createElement(
						InspectorControls,
						null,
						wp.element.createElement(
							PanelBody,
							{
								title: 'Custom CSS',
								initialOpen: false,
								icon: 'admin-appearance'
							},
							wp.element.createElement(TabPanel, {
								className: 'csskube-tabs',
								activeClass: 'is-active',
								initialTabName: (function() {
									// Determine the first tab with CSS content
									if (cssKubeCSS_all && cssKubeCSS_all.trim()) return 'all';
									if (cssKubeCSS_mobile && cssKubeCSS_mobile.trim()) return 'mobile';
									if (cssKubeCSS_tablet && cssKubeCSS_tablet.trim()) return 'tablet';
									if (cssKubeCSS_desktop && cssKubeCSS_desktop.trim()) return 'desktop';
									return 'all'; // Default to 'all' if no CSS exists
								})(),
								tabs: [
									{
										name: 'all',
										title: wp.element.createElement('span', {
											className: 'csskube-tab-title' + (cssKubeCSS_all && cssKubeCSS_all.trim() ? ' has-css' : ''),
											title: 'All Devices'
										},
											wp.element.createElement('span', { className: 'dashicons dashicons-desktop' }),
											'',
											(cssKubeCSS_all && cssKubeCSS_all.trim()) ? wp.element.createElement('span', { className: 'csskube-indicator' }) : null
										)
									},
									{
										name: 'mobile',
										title: wp.element.createElement('span', {
											className: 'csskube-tab-title' + (cssKubeCSS_mobile && cssKubeCSS_mobile.trim() ? ' has-css' : ''),
											title: 'Mobile (max 767px)'
										},
											wp.element.createElement('span', { className: 'dashicons dashicons-smartphone' }),
											'',
											(cssKubeCSS_mobile && cssKubeCSS_mobile.trim()) ? wp.element.createElement('span', { className: 'csskube-indicator' }) : null
										)
									},
									{
										name: 'tablet',
										title: wp.element.createElement('span', {
											className: 'csskube-tab-title' + (cssKubeCSS_tablet && cssKubeCSS_tablet.trim() ? ' has-css' : ''),
											title: 'Tablet (768px - 1024px)'
										},
											wp.element.createElement('span', { className: 'dashicons dashicons-tablet' }),
											'',
											(cssKubeCSS_tablet && cssKubeCSS_tablet.trim()) ? wp.element.createElement('span', { className: 'csskube-indicator' }) : null
										)
									},
									{
										name: 'desktop',
										title: wp.element.createElement('span', {
											className: 'csskube-tab-title' + (cssKubeCSS_desktop && cssKubeCSS_desktop.trim() ? ' has-css' : ''),
											title: 'Desktop (min 1025px)'
										},
											wp.element.createElement('span', { className: 'dashicons dashicons-desktop' }),
											'',
											(cssKubeCSS_desktop && cssKubeCSS_desktop.trim()) ? wp.element.createElement('span', { className: 'csskube-indicator' }) : null
										)
									}
								],
								children: function(tab) {
									let currentValue = '';
									let attributeName = '';
									let helpText = '';

									switch(tab.name) {
										case 'all':
											currentValue = cssKubeCSS_all || '';
											attributeName = 'cssKubeCSS_all';
											helpText = 'CSS that applies to all screen sizes.';
											break;
										case 'mobile':
											currentValue = cssKubeCSS_mobile || '';
											attributeName = 'cssKubeCSS_mobile';
											helpText = 'CSS for mobile devices (max 767px).';
											break;
										case 'tablet':
											currentValue = cssKubeCSS_tablet || '';
											attributeName = 'cssKubeCSS_tablet';
											helpText = 'CSS for tablets (768px - 1024px).';
											break;
										case 'desktop':
											currentValue = cssKubeCSS_desktop || '';
											attributeName = 'cssKubeCSS_desktop';
											helpText = 'CSS for desktop screens (min 1025px).';
											break;
									}

									return wp.element.createElement(TextareaControl, {
										label: 'CSS Styles',
										help: helpText + ' Write CSS like in browser console or use & for custom selectors.',
										value: currentValue,
										onChange: (value) => {
											const newAttrs = {};
											newAttrs[attributeName] = value;
											setAttributes(newAttrs);
										},
										placeholder: 'Direct properties:\nbackground-color: #f0f0f0;\npadding: 20px;\n\nOr with selectors:\n& { padding: 20px; }\n&:hover { opacity: 0.8; }\n& p { color: red; }',
										rows: 10,
										className: 'csskube-css-textarea'
									});
								}
							})
						)
					)
				)
			);
		};
	}, 'withCSSControl');

	addFilter(
		'editor.BlockEdit',
		'csskube/with-css-control',
		withCSSControl
	);

	/**
	 * Get media query string based on selection
	 */
	function getMediaQuery(mediaQueryType) {
		switch (mediaQueryType) {
			case 'mobile':
				return '@media (max-width: 767px)';
			case 'tablet':
				return '@media (min-width: 768px) and (max-width: 1024px)';
			case 'desktop':
				return '@media (min-width: 1025px)';
			case 'all':
			default:
				return '';
		}
	}

	/**
	 * Apply custom CSS to the block wrapper in the editor
	 */
	const applyCustomCSS = createHigherOrderComponent((BlockListBlock) => {
		return (props) => {
			const { attributes, clientId } = props;
			const { cssKubeCSS_all, cssKubeCSS_mobile, cssKubeCSS_tablet, cssKubeCSS_desktop } = attributes;
			const styleRef = useRef(null);

			// Apply CSS in the editor
			useEffect(() => {
				// Check if any CSS exists
				const hasCSS = (cssKubeCSS_all && cssKubeCSS_all.trim()) ||
							   (cssKubeCSS_mobile && cssKubeCSS_mobile.trim()) ||
							   (cssKubeCSS_tablet && cssKubeCSS_tablet.trim()) ||
							   (cssKubeCSS_desktop && cssKubeCSS_desktop.trim());

				if (!hasCSS) {
					// Remove style element if no CSS
					if (styleRef.current) {
						styleRef.current.remove();
						styleRef.current = null;
					}
					return;
				}

				// Get the target document (iframe for Site Editor, main document for Post Editor)
				let targetDocument = document;
				const editorCanvas = document.querySelector('iframe[name="editor-canvas"]');
				if (editorCanvas && editorCanvas.contentDocument) {
					targetDocument = editorCanvas.contentDocument;
				}

				// Simple selector using data-block attribute
				const blockSelector = '[data-block="' + clientId + '"]';

				// Process each CSS type
				let allProcessedCSS = '';

				// Helper function to process individual CSS
				function processIndividualCSS(css, mediaQueryType) {
					if (!css || css.trim() === '') return '';

					let processedCSS = css.trim();

					// Check if CSS contains selectors (has { and })
					if (processedCSS.indexOf('{') !== -1 && processedCSS.indexOf('}') !== -1) {
						// CSS has custom selectors - replace & with the block selector
						processedCSS = processedCSS.replace(/&/g, blockSelector);
					} else {
						// Direct CSS properties - wrap with block selector
						processedCSS = blockSelector + ' { ' + processedCSS + ' }';
					}

					// Wrap CSS in media query if specified
					const mediaQuery = getMediaQuery(mediaQueryType);
					if (mediaQuery) {
						processedCSS = mediaQuery + ' { ' + processedCSS + ' }';
					}

					return processedCSS;
				}

				// Process all four CSS types
				allProcessedCSS += processIndividualCSS(cssKubeCSS_all, 'all');
				allProcessedCSS += processIndividualCSS(cssKubeCSS_mobile, 'mobile');
				allProcessedCSS += processIndividualCSS(cssKubeCSS_tablet, 'tablet');
				allProcessedCSS += processIndividualCSS(cssKubeCSS_desktop, 'desktop');

				// Create or update style element in the target document
				if (!styleRef.current || !styleRef.current.parentNode) {
					// Remove old style if it exists in wrong document
					if (styleRef.current) {
						styleRef.current.remove();
					}

					// Create new style element in correct document
					styleRef.current = targetDocument.createElement('style');
					styleRef.current.setAttribute('data-csskube-block', clientId);
					targetDocument.head.appendChild(styleRef.current);
				}

				styleRef.current.textContent = allProcessedCSS;

				// Cleanup on unmount
				return () => {
					if (styleRef.current) {
						styleRef.current.remove();
						styleRef.current = null;
					}
				};
			}, [cssKubeCSS_all, cssKubeCSS_mobile, cssKubeCSS_tablet, cssKubeCSS_desktop, clientId]);

			// Add data attribute to the block wrapper
			let wrapperProps = props.wrapperProps || {};

			// Check if any CSS exists
			const hasCSS = (cssKubeCSS_all && cssKubeCSS_all.trim()) ||
						   (cssKubeCSS_mobile && cssKubeCSS_mobile.trim()) ||
						   (cssKubeCSS_tablet && cssKubeCSS_tablet.trim()) ||
						   (cssKubeCSS_desktop && cssKubeCSS_desktop.trim());

			if (hasCSS) {
				wrapperProps = {
					...wrapperProps,
					'data-block': clientId
				};
			}

			return wp.element.createElement(BlockListBlock, {
				...props,
				wrapperProps: wrapperProps
			});
		};
	}, 'applyCustomCSS');

	addFilter(
		'editor.BlockListBlock',
		'csskube/apply-custom-css',
		applyCustomCSS
	);

})();
