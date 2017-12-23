import React from 'react'
import {View} from 'react-native'
import BasePage from '../page/BasePage'
import {CommonKeyValueItem,Button} from '../components'

class xxxPage extends BasePage {

    static defaultProps = {
        header: {
            title: 'xxxx'
        },
    }

    constructor(props) {
        super(props)
        this.state = {}
    }


    renderContainer = () => {
        return (<View></View>)
    }

}


export default xxxPage