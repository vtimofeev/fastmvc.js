/**
 * Created by Vasily on 16.09.2016.
 */
module ui.def {
    export var MultiPageGroup = {
        className: 'ui.MultiPageGroup',
        content: `

        <div .base="multi-page-group" class="{state.base}>" 
            <h3>Items-5</h3> 
            
            <ui.Group .model="{model.items}"></ui.Group>  
            <h4>Pages-3</h4> 
            <ui.Group .base="pages" .model="{model.pages}" .value="{model.seletedPage}" .out.value="model.seletedPage"></ui.Group> 
        </div>

`,
        mixin: {
            isSelected(child, parent) {
                var data = child.model || child.data,
                    result = this.value && (this.state.multiple ? this.value.indexOf(data) > -1 : this.value === data);

                console.log('IsSelected ? ', data, result, 'Child is ', child, parent);
                return result;
            },

            setGroupItem(data):void {
                if(this.state.multiple) {
                    this.value = [].concat(this.value, data);
                } else {
                    this.value = data;
                }
                this.getDefaultChildrenView().applyChildrenParameter(null, 'children.selected');
            },

            removeGroupItem(data):void {
                if(this.state.multiple) {
                    this.value.splice(this.value.indexOf(data), 1);
                    this.value = [].concat(this.value);
                } else {
                    this.value = null;
                }
                this.getDefaultChildrenView().applyChildrenParameter(null, 'children.selected');
            },

            internalHandlerImpl: function (e:fmvc.IEvent) {
                var data = e && e.target && (e.target.model || e.target.data);

                switch (e.type) {
                    case 'item': {
                        (e.target.selected?this.setGroupItem:this.removeGroupItem)(data);
                        break;
                    }
                }

            }
        }

    }
}
