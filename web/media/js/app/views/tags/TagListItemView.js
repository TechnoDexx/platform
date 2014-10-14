/**
 * User List Item View
 *
 * @module     UserListItemView
 * @author     Ushahidi Team <team@ushahidi.com>
 * @copyright  2013 Ushahidi
 * @license    https://www.gnu.org/licenses/agpl-3.0.html GNU Affero General Public License Version 3 (AGPL3)
 */

define(['App', 'marionette', 'util/notify', 'hbs!templates/tags/TagListItem'],
	function(App, Marionette, notify, template)
	{
		return Marionette.ItemView.extend(
		{
			template: template,
			tagName: 'li',
			className: 'list-view-tag',

			// Value to track if checkbox for this post has been selected
			selected : false,
			events: {
				'click .js-tag-delete': 'deleteTag',
				'click .js-tag-edit' : 'showEditTag',
				'change .js-select-input' : 'updatedSelected',
			},

			modelEvents: {
				'sync': 'render'
			},

			deleteTag: function(e)
			{
				e.preventDefault();
				notify.destroy(this.model, 'tag');
			},

			showEditTag : function (e)
			{
				e.preventDefault();
				App.vent.trigger('tag:edit', this.model);
			},

			/**
			 * Select this item (for bulk actions)
			 */
			select : function ()
			{
				this.selected = true;
				this.$('.js-select-input').prop('checked', true)
					.parent()
					.addClass('selected-button', this.selected);
				this.trigger('select');
			},

			/**
			 * Unselect this item (for bulk actions)
			 */
			unselect : function ()
			{
				this.selected = false;
				this.$('.js-select-input').prop('checked', false)
					.parent()
					.removeClass('selected-button', this.selected);
				this.trigger('unselect');
			},

			updatedSelected : function (e)
			{
				var $el = this.$(e.currentTarget);
				this.selected = $el.is(':checked');
				this.trigger(this.selected ? 'select' : 'unselect');

				$el.parent()
					.toggleClass('selected-button', this.selected);
			}
		});
	});
