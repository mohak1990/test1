import React from 'react';
import './style.css';

export default class ContextMenu extends React.Component {
    
    constructor(props) {
        super(props);

        this.state = {
            target: '',
            currRow: this.props.currRow || {}
        }
    }

    componentDidMount () {
        
        let context = document.getElementById(this.props.contextID);
        context.addEventListener('contextmenu', (event) => {this.openContextMenu(event) });
        
        let menu = document.getElementById('contextMenu');
        menu.addEventListener('mouseleave', () => {this.closeContextMenu()});

        document.addEventListener('click', function(event) {
            var isClickInside = menu.contains(event.target);
            if (!isClickInside) {
                this.closeContextMenu(event);
            }
        }.bind(this));
    }

    positioningContextMenu (e) {
            
            var menuPostion = {};
            var windowHeight = $(window).height()/2;
            var windowWidth = $(window).width()/2;

            if(e.clientY > windowHeight && e.clientX <= windowWidth) {
                menuPostion.left = e.clientX;
                menuPostion.bottom = $(window).height()-e.clientY;
                menuPostion.right = "auto";
                menuPostion.top = "auto";
            } else if(e.clientY > windowHeight && e.clientX > windowWidth) {
                menuPostion.right = $(window).width()-e.clientX;
                menuPostion.bottom = $(window).height()-e.clientY;
                menuPostion.left = "auto";
                menuPostion.top = "auto";
            } else if(e.clientY <= windowHeight && e.clientX <= windowWidth) {
                menuPostion.left = e.clientX;
                menuPostion.top = e.clientY;
                menuPostion.right = "auto";
                menuPostion.bottom = "auto";
            } else {
                menuPostion.right = $(window).width()-e.clientX;
                menuPostion.top = e.clientY;
                menuPostion.left = "auto";
                menuPostion.bottom = "auto";
            }

            return menuPostion;
    }

    render () {
     
        return (
            <div id="contextMenu">
                {this.props.items.map((item) => {
                        
                        let clickHandler = () => {
                            this.closeContextMenu();
                            item.function(this.state.currRow, item.label, this.state.target);
                        }

                        let label = item.label;
                        let icon = item.icon;
                        
                        return (
                            <span onClick={clickHandler} key={label}>
                                {/*{<img className="icon" src={icon} role="presentation" />}*/}
                                {label}
                            </span>
                        );
                    })}
            </div>
        );
    }

    openContextMenu(event) {
        
        if(event.target.tagName == "TD")
        {
            event.preventDefault();

            this.setState({target: event.target});
            this.setState({currRow: this.state.currRow});

            let menu = document.getElementById('contextMenu');

            var pos = this.positioningContextMenu(event);

            menu.style.cssText =
                'left: ' + pos.left + 'px;' + 
                'top: ' + pos.top + 'px;' +
                'right: ' + pos.right + 'px;' + 
                'bottom: ' + pos.bottom + 'px;' +
                'visibility: visible;';
        }
    }

    closeContextMenu() {
        let menu = document.getElementById('contextMenu');
        menu.style.cssText = 'visibility: hidden;';
    }
}
