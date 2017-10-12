var React    = require('react')
var ReactDOM = require('react-dom');       
require('./SGInlineEditTable.css');
var classNames = require('classnames');

var StickyGrid = React.createClass({
    
    getInitialState: function(){

    return { 
            isColGroup : this.props.isColGroup,
            fixedCols : this.props.fixedCols
        }
    },

    onRowClick: function(index){
        
        this.props.onRowClick(index);
    },
    
    onRowDoubleClick: function(row){
    
        this.props.onDoubleClick(row);
    },

    refreshRow: function()
    {    
       // this.props.updateCurrRow(this.state.rowObj);
        this.forceUpdate();
    },

    showTooltip: function(rowIndex, colIndex, text, rowObj, col){
           
           this.props.showTooltip(rowIndex, colIndex, text, rowObj, col);
    },

    render: function() {
        
        var $this = this;
        var trClasses = classNames({
            
            ["SGTableRow"] : true

        });
        
        return (
            <div ref="SGInlineEditTable" className='SGInlineEditTable' id={this.props.id} style={{background : '#f5f5f5', position : "absolute", zIndex: "10"}}>
                <div style={{position:"absolute", width:"100%", overflow: "hidden"}}>
                    <table className= {(this.props.Mode && this.props.Mode.toLowerCase() == "dblist")?"SGTableHeader dubbedTableHeader": "SGGridHeader"} cellSpacing={0} cellPadding={0}>
                        <thead> 
                            <tr>
                                {$this.props.SGcolumns.map(function(col, i){
                                    var colhidden = (typeof col.hidden == "function") ? col.hidden(): col.hidden;
                                        if($this.state.fixedCols > i)
                                        {
                                            return (
                                                colhidden != true ? (
                                                    <td style={{ textAlign: 'center', width: col.width, maxWidth: col.width  }} key = {i}></td>
                                                ):null
                                            )
                                        }
                                    })
                                }
                            </tr>
                            {$this.state.isColGroup ? (
                            <tr className="SGTableHeaderTR CommonHeader">
                                {  
                                    Object.keys($this.props.groupColumns()).map(function(key, i) {
                                        return (
                                            <td colSpan={$this.props.groupColumns()[key]}>
                                                {key != "undefined" ? key : ""}
                                            </td>
                                        )
                                    })
                                }
                            </tr>
                            ) : null}

                            <tr>
                                {$this.props.SGcolumns.map(function(col, i){
                                    if($this.state.fixedCols > i){
                                            var colhidden = (typeof col.hidden == "function") ? col.hidden(): col.hidden;
                                            return (
                                                colhidden != true ? (
                                                    <td style={{ textAlign: 'center', width: col.width, maxWidth: col.width }} > {col.title} </td>
                                                ):null
                                            ) 
                                        }
                                    })
                                }
                            </tr>
                        </thead>
                    </table>
                </div>
                <table className="SGInlineEditTable"  cellSpacing={0} cellPadding={0}>
                    <tr>
                        <td>
                            <div style={{height:'20px'}}>
                            </div> 
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <div id={this.props.id} className='SGTableBodyContainer dubbedTableBodyContainer' style={{maxHeight: parseInt(this.props.height) - 16, height: parseInt(this.props.height) - 16, overflow: "hidden"}} >
                                <table className="SGTableBody" style={{ tableLayout : "fixed" }} cellSpacing={0} cellPadding={0}>
                                    <tbody>
                                        <tr style={{height: "0px"}}>
                                            {$this.props.SGcolumns.map(function(col, i){
                                                 
                                                 if($this.state.fixedCols > i){
                                                    var colhidden = (typeof col.hidden == "function") ? col.hidden(): col.hidden;
                                                        return(
                                                            colhidden != true ? (
                                                                <td style={{  width: col.width, maxWidth: col.width }}> 
                                                                </td>
                                                            ): null
                                                        )
                                                    }
                                                })
                                            }
                                            <td></td>
                                        </tr>
                                        {$this.props.dataSource.map(function(row, ri){
                                            
                                            var rowStyle = undefined;

                                            if($this.props.rowStyle != undefined)
                                            {
                                                rowStyle = $this.props.rowStyle(row);
                                            }

                                            return (
                                                <tr style={rowStyle} id={ri} className={trClasses} onClick={$this.onRowClick.bind(null, ri)} onDoubleClick={$this.onRowDoubleClick.bind(null, row)}>
                                                    {$this.props.SGcolumns.map(function(col, i){
                                                        
                                                        var staticComp = (typeof col.OnCellPreRender == "function") ? col.OnCellPreRender({data : row}, false): col.OnCellPreRender;

                                                        var tdClasses = classNames({
                                                            ["SGTableTD"] : true,
                                                            [`SGTableTD-${$this.state.index}-${i}`] : true,
                                                        });

                                                        var colStyle = undefined;
                                                        if(col.colStyle != undefined)
                                                        {
                                                            colStyle = col.colStyle(row);
                                                        }
                                                        
                                                        if($this.state.fixedCols > i)
                                                        {   var colhidden = (typeof col.hidden == "function") ? col.hidden(): col.hidden;
                                                            return (
                                                                colhidden != true ? (
                                                                    <td style={{...colStyle, width: col.width, maxWidth: col.width, cursor:'default' }} 
                                                                        className = {tdClasses}
                                                                        onMouseOver={$this.showTooltip.bind($this, ri , i, row[$this.props.SGcolumns[i].name], row, col)}
                                                                        onMouseOut = {$this.props.hideTooltip}
                                                                    > 
                                                                        {( staticComp != undefined ) ? staticComp : row[col.name]}
                                                                    </td>
                                                                ):null
                                                            )
                                                        }
                                                    })}
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </td>
                    </tr>
                </table>
            </div>
        )
    }
});

module.exports = StickyGrid;