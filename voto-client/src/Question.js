import React from 'react';

class Question extends React.Component { 
    
    render() {
        const {url} = this.props

        return(
            <div>
                <img src = {url} alt = "Question"/>
            </div>
        );
    }

}

export default Question;
