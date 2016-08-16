module ui.def {
    export var Group = {
        className: 'ui.Group',
        content: '<div .base="group" ' +
        ' class="{state.base}" ' +
        ' .children.selected="{this.isSelected(this.child)}" ' +
        ' .children.base="button" ' +
        ' .children.class="ui.ToggleButton" ' +
        ' .children.onaction="item"></div>', //' .children.stateHandlers="hover,selected" ' +
        mixin: {
            isSelected(child) {
                var data = child.model || child.data,
                    result = this.value && (this.state.multiple ? this.value.indexOf(data) > -1 : this.value === data);

                console.log('IsSelected ? ', data, result, 'Child is ', child);
                return result;
            },
            internalHandler: function (name, e) {
                var data = e && e.target && (e.target.model || e.target.data);

                switch (name) {
                    case 'item': {
                        if(e.target.selected) {

                            if(this.state.multiple) {
                                this.value = [].concat(this.value, data);
                            } else {
                                this.value = data;
                            }

                            this.getDefaultChildrenView().applyChildrenParameter(null, 'children.selected');


                        }
                        else {

                            if(this.state.multiple) {
                                this.value.splice(this.value.indexOf(data), 1);
                                this.value = [].concat(this.value);
                            } else {
                                this.value = null;
                            }

                            this.getDefaultChildrenView().applyChildrenParameter(null, 'children.selected');

                        }
                    }
                }

            }
        }

    }
}
