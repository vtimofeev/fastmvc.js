module ui.def {
    import TemplateView = ft.TemplateView;
    export var Group = {
        className: 'ui.Group',
        content: '<div .base="group" ' +
        ' class="{state.base} {state.custom}" ' +
        ' .children.selected="{this.isSelected(current)}" ' +
        ' .children.base="button" ' +
        ' .children.class="ui.ToggleButton" ' +
    //    ' .children.hover="{cc.childIndex===state.hoverIndex}" ' +
        ' .children.onaction="item"></div>',
        mixin: {

            isSelected(child) {
                //console.log('G:Is selected ', child, this.value);

                var data = child.model || child.data,
                    result = this.value && (this.state.multiple ? this.value.indexOf(data) > -1 : this.value === data);


                return result;
            },

            setGroupItem(data):void {
                //console.log('Set item data ', data, this.value);

                if(this.state.multiple) {
                    this.value = [].concat(this.value, data);
                } else {
                    this.value = data;
                }
                //@todo replace
                this.childrenVMData && this.childrenVMData.forEach( (v:TemplateView)=>v.setState('selected', this.isSelected(v)) );
                //this.getDefaultChildrenView().applyChildrenParameter(null, 'children.selected');
            },

            removeGroupItem(data):void {
                if(this.state.multiple) {
                    this.value.splice(this.value.indexOf(data), 1);
                    this.value = [].concat(this.value);
                } else {
                    this.value = null;
                }

                this.childrenVMData && this.childrenVMData.forEach( (v:TemplateView)=>v.setState('selected', this.isSelected(v)) );
                //@todo replace
                //this.getDefaultChildrenView().applyChildrenParameter(null, 'children.selected');
            },

            internalHandlerImpl: function (e:fmvc.IEvent) {
                var data = e && e.target && (e.target.model || e.target.data);

                switch (e.type) {
                    case 'item': {
                        (e.target.selected?this.setGroupItem:this.removeGroupItem).call(this, data);
                        break;
                   }
                }

            }
        }

    }
}
