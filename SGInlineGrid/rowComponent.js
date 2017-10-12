var classNames = require('classnames');
var React    = require('react')
var ReactDOM = require('react-dom') 
var $ = require('jquery')
var CheckComp = require("../checkBox");

var RowComponent = React.createClass({

    getInitialState: function () {
        
        return {
            
            idProperty: this.props.idProperty,
            rowObj : this.props.rowObj,
            index : this.props.index,
            rowId : this.props.rowId,
            EditMode: this.props.EditMode,
            rowState: this.props.rowState,
            currRow: this.props.currRow,
            multiSelect: this.props.multiSelect,
            chkBoxDisable: this.props.chkBoxDisable
        }
    },
    
    componentWillReceiveProps: function(nextProps) {
             
        this.setState({
            rowObj : nextProps.rowObj,
            EditMode : nextProps.EditMode,
            index : nextProps.index
        });
    },
    
    shouldComponentUpdate: function(nextProp, nextState){
          
            return  nextProp.EditMode != this.props.EditMode || 
                    nextProp.index != this.props.index || 
                    nextProp.rowObj != this.props.rowObj || 
                    nextProp.chkBoxDisable != this.props.chkBoxDisable ||
                    nextState.rowState != this.state.rowState
    },

    componentDidUpdate: function(prevProps, prevState){
        
        //when the row completely renders in edit mode
        if(prevState.EditMode)
        {
            this.props.afterClick();
        }
    },
     
    onRowClick: function(index, rowId, row, event){
        
        event.persist();

        if(event.target.nodeName != "A" || event.target.nodeName == "INPUT" )
        {
            if(event.button == 0 || event.button == 2)
            {
                if(!this.state.multiSelect)
                {   
                    this.props.onRowClick(index, rowId, row, this);
                }
            }
        }
    },
    
    onRowDoubleClick: function(rowObj){
           
        if(this.props.onRowDoubleClick)
        {
            this.props.onRowDoubleClick(rowObj);
        }
    },
      
    showTooltip: function(rowIndex, colIndex, text, rowObj, col){
           if(this.props.showTooltip)  
                this.props.showTooltip(rowIndex, colIndex, text, rowObj, col);
    },

    onChangeEvent: function(rowIndex, col, userOnChange, editorName, editor, val)
    {     
         //for dropdown components with name-value 
         if(col.value !== undefined) 
         {  
            this.state.rowObj[col.name] = val.label;
            this.state.rowObj[col.value] = val.value;
         }
         else
         {
            this.state.rowObj[col.name] = val;
            //this.props.updateCell(rowIndex, col.name, val, this);
         }
         
         this.props.updateCurrRow(this.state.rowObj);
         this.forceUpdate();
         
         //user editor event
         if(userOnChange != undefined)
            userOnChange(val, rowIndex, this.state.rowObj, this.refreshRow);
    },     
     
    refreshRow: function()
    {    
        this.props.updateCurrRow(this.state.rowObj);
        this.forceUpdate();
    },

    onCheckChange: function(isCheck)
    {   
        this.props.setCheck(this.state.index, isCheck, this.state.rowObj);
        this.forceUpdate();
    },
    getRowToolTip:function()
    {
        if(this.props.rowToolTip !== undefined )
        {
          if(typeof this.props.rowToolTip == "function")
           return this.props.rowToolTip(this.state.rowObj);
         else
           return this.props.rowToolTip;
        }
        return "";        
    },
    render: function () {
            
        var $this = this;
        var trClasses = classNames({
            ["SGTableRow"] : true,
            ["SelectedRow"] : this.state.rowState, //multiselect row class
            ["SGTableRowSelected"] : this.state.EditMode,
            
        });
      
        var chkClasses = classNames({
            ["multiSelectCol"] : true,
            ["chkBoxDisable"] : this.state.chkBoxDisable
        });
        
        return(
            $this.state.EditMode == false ? (
                    <tr style = {this.props.rowStyle} key = {this.state.index} id = {this.state.index} className = {trClasses} onClick={$this.onRowClick.bind($this, this.state.index, this.state.rowId, this.state.rowObj)} onDoubleClick={$this.onRowDoubleClick.bind($this, this.state.rowObj)}
                    title={$this.getRowToolTip()}>
                        {$this.state.multiSelect? (
                            <td style={{textAlign:"center"}} className= {chkClasses}>
                                {(this.state.multiSelect)?
                                    <CheckComp style={{height: "10px"}} id={"check" + this.state.index} checked={this.state.rowState} onChange={(isCheck)=>this.onCheckChange(isCheck)} />
                                    :
                                    null}
                            </td>
                        ): null}
                        {$this.props.SGcolumns.map(function(col, i) {
                            //To show static data
                            var staticComp = (typeof col.OnCellPreRender == "function") ? col.OnCellPreRender({data : $this.state.rowObj, refresh :$this.refreshRow }, false): col.OnCellPreRender;

                            var link = new Function($this.state.rowObj[col.link]);
                            
                            var tdClasses = classNames({
                                ["SGTableTD"] : true,
                                ["RowsDisabled"] : $this.state.multiSelect,
                                ["TextWrap"] : $this.props.TextWrap,
                                [`SGTableTD-${$this.state.index}-${i}`] : true,
                                [`SGTableTD-hiddenClass-${$this.state.rowObj[col.name]}`] : col.visibility,
                            });
                            
                            var colStyle = undefined;
                            if(col.colStyle != undefined)
                            {
                                colStyle = col.colStyle($this.state.rowObj);
                            }
                            
                            var colhidden = (typeof col.hidden == "function") ? col.hidden(): col.hidden;
                            
                            return ( 
                                   colhidden == true ? 
                                   (
                                       null 
                                   )
                                   :
                                   (col.linkText !== undefined && $this.state.rowObj[col.link] != null && $this.state.rowObj[col.link] != "" && $this.state.rowObj[col.link] != undefined) ? 
                                   ( <td align="right" className = {tdClasses} key = {i} style={{ ...colStyle, cursor:'default', textAlign: $this.props.SGcolumns[i].align }} onMouseOver={$this.showTooltip.bind($this, $this.state.index, i, $this.state.rowObj[$this.props.SGcolumns[i].name],$this.state.rowObj, col  )} onMouseOut = {(col.customTooltip != undefined || $this.props.hideTooltip) ? $this.props.hideTooltip : null}>
                                            <a title={$this.state.rowObj[col.linkTooltip]} style={$this.props.rowStyle} href='javascript:void(0)' onClick={()=>link()} > {$this.state.rowObj[col.name]} </a>
                                     </td> )
                                   : 
                                   ( <td align="right" className = {tdClasses} key = {i} style={{ ...colStyle, cursor:'default', textAlign: $this.props.SGcolumns[i].align, paddingLeft:"2px", paddingRight:"2px" }} onMouseOver={$this.showTooltip.bind($this, $this.state.index, i, $this.state.rowObj[$this.props.SGcolumns[i].name],$this.state.rowObj, col  )} onMouseOut = { (col.customTooltip != undefined|| $this.props.hideTooltip) ? $this.props.hideTooltip : null}>
                                          {  
                                            ( staticComp!=undefined ) 
                                                ? 
                                                    staticComp 
                                                :
                                                <div 
                                                    dangerouslySetInnerHTML={{__html:   $this.state.rowObj[col.name]}}>
                                                </div>
                                         }
                                     </td> )
                                )
                            })
                        }
                        <td> 
                        </td>
                    </tr>
            ):
            <tr style = {this.props.rowStyle} className={trClasses} id = {this.state.index} onDoubleClick={$this.onRowDoubleClick.bind($this, this.state.rowObj)}  title={$this.getRowToolTip()}>
                {$this.state.multiSelect? (
                    <td style={{textAlign:"center"}}  className="multiSelectCol">
                        {(this.state.multiSelect)?
                        <CheckComp style={{height: "10px"}} id={"check" + this.state.index} checked={this.state.rowState} onChange={(isCheck)=>this.onCheckChange(isCheck)}/>
                        :
                        null}
                    </td>
                ): null}
                {$this.props.SGcolumns.map(function(col, i) {

                        var staticComp = (typeof col.OnCellPreRender == "function") ? col.OnCellPreRender({data :$this.state.rowObj, refresh : $this.refreshRow }, true): col.OnCellPreRender;
                         
                        var link = new Function($this.state.rowObj[col.link]);
                     
                        var tdClasses = classNames({
                            ["SGTableTD"] : true,
                            ["RowsDisabled"] : $this.state.multiSelect,
                            [`SGTableTD-${$this.state.index}-${i}`] : true,
                        });

                        var componentClone = {};

                        var editor = (typeof col.editor == "function") ? col.editor() : col.editor;

                        //setting the component
                        if(col.editor != undefined)                                     
                        {   
                            var prop = {};
                            var valueCol = (col.value == undefined || col.value == "" ? col.name : col.value);
                            //Assign value to Control
                            prop[col.setter] = $this.state.rowObj[valueCol];    
                            
                            //userComponent onChange event
                            var userOnChange = editor.props.onChange;           
                            
//                            if(userOnChange != undefined)
                                prop["onChange"] = $this.onChangeEvent.bind(
                                    $this, $this.state.index, col, userOnChange, editor.type.displayName, editor);
                            
                            componentClone = React.cloneElement(editor, prop);
                        }
                        
                        var colhidden = (typeof col.hidden == "function") ? col.hidden() : col.hidden; 

                        return (
                                colhidden == true ?  
                                (
                                    null 
                                )
                                :
                                col.editor != undefined ?               
                                ( 
                                    <td className = {tdClasses} key = {i} style={{ cursor:'default', textAlign: $this.props.SGcolumns[i].align }} >
                                        {componentClone}
                                    </td>
                                )
                                : 
                                (
                                (col.linkText !== undefined && $this.state.rowObj[col.link] != null && $this.state.rowObj[col.link] != "" && $this.state.rowObj[col.link] != undefined) ? 
                                    
                                (
                                    <td align="right" className = {tdClasses} key = {i} style={{ cursor:'default', textAlign: $this.props.SGcolumns[i].align }} onMouseOver={$this.showTooltip.bind($this, $this.state.index, i, $this.state.rowObj[$this.props.SGcolumns[i].name],$this.state.rowObj, col  )} onMouseOut = {(col.customTooltip != undefined || $this.props.hideTooltip) ? $this.props.hideTooltip : null}>
                                            <a title={$this.state.rowObj[col.linkTooltip]} href='javascript:void(0)' style={$this.props.rowStyle} onClick={()=>link()} > {$this.state.rowObj[col.name]} </a>
                                    </td>
                                )
                                : 
                                (
                                    <td className = {tdClasses} key = {i} style={{ cursor:'default', textAlign: $this.props.SGcolumns[i].align }} 
                                        onMouseOver={$this.showTooltip.bind($this, $this.state.index, i, $this.state.rowObj[$this.props.SGcolumns[i].name],$this.state.rowObj, col  )} 
                                        onMouseOut = {(col.customTooltip != undefined || $this.props.hideTooltip) ? $this.props.hideTooltip : null} >
                                        {
                                            (staticComp != undefined) 
                                            ? 
                                                staticComp 
                                            :
                                            <div 
                                                dangerouslySetInnerHTML={{__html: $this.state.rowObj[col.name]}}>
                                            </div>
                                        
                                        }
                                    </td>
                                )
                                )
                            )
                        })
                    }
                    <td> 
                    </td>
            </tr>
        )
    }
});

module.exports = RowComponent;