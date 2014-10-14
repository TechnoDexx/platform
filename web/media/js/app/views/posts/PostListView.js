/**
 * Post List View
 *
 * @module     PostListView
 * @author     Ushahidi Team <team@ushahidi.com>
 * @copyright  2013 Ushahidi
 * @license    https://www.gnu.org/licenses/agpl-3.0.html GNU Affero General Public License Version 3 (AGPL3)
 */

define(['App', 'modules/config', 'marionette', 'handlebars','underscore', 'alertify', 'util/notify',
		'views/posts/PostListItemView',
		'hbs!templates/posts/PostList',
		'views/EmptyView',
		'mixin/PageableViewBehavior'
	],
	function( App, config, Marionette, Handlebars, _, alertify, notify,
		PostListItemView,
		template,
		EmptyView,
		PageableViewBehavior
	)
	{
		return Marionette.CompositeView.extend(
		{
			template: template,
			modelName: 'posts',

			initialize: function()
			{
				// Bind select/unselect events from childviews
				this.on('childview:select', this.showHideBulkActions, this);
				this.on('childview:unselect', this.showHideBulkActions, this);
			},

			childView: PostListItemView,

			emptyViewOptions:
			{
				emptyMessage: 'No posts found.',
			},

			emptyView: EmptyView,

			childViewContainer: '.list-view-post-list',

			events:
			{
				'click .js-post-bulk-publish' : 'bulkPublish',
				'click .js-post-bulk-unpublish' : 'bulkUnpublish',
				'click .js-post-bulk-delete' : 'bulkDelete',
				'change .js-select-all-input' : 'selectAll',
				'click .js-post-bulk-export' : 'exportPostCsv'
			},

			behaviors: {
				PageableViewBehavior: {
					behaviorClass : PageableViewBehavior,
					modelName: 'posts',
				}
			},

			/**
			 * Get select child views
			 */
			getSelected : function ()
			{
				return this.children.filter('selected');
			},

			/**
			 * Show / Hide bulk actions toolbar when posts are selected
			 */
			showHideBulkActions : function ()
			{
				var selected = this.getSelected();

				if (selected.length > 0)
				{
					this.$('.js-list-view-bulk-actions').removeClass('visually-hidden');
					this.$('.js-list-view-bulk-actions').addClass('visible');
				}
				else
				{
					this.$('.js-list-view-bulk-actions').removeClass('visible');
					this.$('.js-list-view-bulk-actions').addClass('visually-hidden');
				}
			},

			/**
			 * Bulk publish selected posts
			 */
			bulkPublish : function (e)
			{
				e.preventDefault();

				var selected = this.getSelected();

				_.each(selected, function(item) {
					var model = item.model;
					model.set('status', 'published');
					notify.save(model, 'post', 'publish');
				} );
			},

			/**
			 * Bulk unpublish selected posts
			 */
			bulkUnpublish : function (e)
			{
				e.preventDefault();

				var selected = this.getSelected();

				_.each(selected, function(item) {
					var model = item.model;
					model.set('status', 'draft');
					notify.save(model, 'post', 'unpublish');
				} );
			},

			/**
			 * Bulk delete selected posts
			 */
			bulkDelete : function (e)
			{
				e.preventDefault();

				var selected = this.getSelected();

				notify.bulkDestroy(selected, 'post');
			},

			/**
			 * Select all posts
			 */
			selectAll : function ()
			{
				//e.preventDefault();

				var $el = this.$('.js-select-all-input');

				if ($el.is(':checked'))
				{
					this.children.each(function (child) { child.select(); });
					this.$('.select-text').addClass('visually-hidden');
					this.$('.unselect-text').removeClass('visually-hidden');
				}
				else
				{
					this.children.each(function (child) { child.unselect(); });
					this.$('.select-text').removeClass('visually-hidden');
					this.$('.unselect-text').addClass('visually-hidden');
				}
			},

			serializeData : function ()
			{
				var data = { items: this.collection.toJSON() };
				data = _.extend(data, {
					pagination: this.collection.state,
					pageSizes: this.collection.pageSizes,
					sortKeys: this.collection.sortKeys,
					modelName : this.modelName
				});

				return data;
			},
			exportPostCsv : function(e) {
				e.preventDefault();
				App.oauth.ajax({
					url : config.get('apiurl') + 'posts/export',
					dataType : 'json'
				}).done(function(data) {
					if (data)
					{
						var download = data.total_count + ' posts exported: <a href="' + data.link + '" download> Click to download as CSV file</a>';
						alertify.confirm( download);
					}
				}).fail(function()
				{
					alertify.error('Unable to export posts as CSV');
				});

				// Close workspace
				App.vent.trigger('workspace:toggle', true);
			}
		});
	});
