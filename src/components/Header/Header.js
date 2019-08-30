import React from 'react';
import { OrderPriorityContext } from '../../context/OrderPriorityContext';
import classnames from 'classnames';

export default class Header extends React.Component {

    static contextType = OrderPriorityContext;

    state = {
        hasResources: false
    };

    resourceList = null;
    resourceContainer = null;

    constructor(props) {
        super(props);

        this.showResourceList = this.showResourceList.bind(this);
    }

    componentDidMount() {
        const {
            params: {resources: resourcesList},
            id,
            language = 'en',
            collectExportValues,
        } = this.context;

        const filterResourceList = element => Object.keys(element).length !== 0 && element.constructor === Object;
        if( resourcesList.params.resourceList && resourcesList.params.resourceList.filter(filterResourceList).length > 0){
            this.resourceList = new H5P.ResourceList(resourcesList.params, id, language);
            this.resourceList.attach(this.resourceContainer);

            this.setState({
                hasResources: true
            });
        }
        collectExportValues('resources', () => resourcesList.params.resourceList
            .filter(filterResourceList)
            .map(resource => Object.assign({}, {
                title: "",
                url: "",
                introduction: "",
            }, resource)) || []);
    }

    showResourceList() {
        this.resourceList.show();
    }

    render() {
        const {
            params: {
                header,
                description
            },
            translations
        } = this.context;

        return (
            <header className={"h5p-order-priority-header"}>
                {this.resourceList !== null && this.state.hasResources === true && (
                    <button className={"h5p-order-priority-resources-btn"} onClick={this.showResourceList}>
                        <span className={classnames(['fa-stack'])}>
                            <i className={"fa fa-circle-thin fa-stack-2x"} />
                            <i className={"fa fa-info fa-stack-1x"} />
                        </span>
                        <span>{translations.resources}</span>
                    </button>
                )}
                <h2>{header}</h2>
                <div className={classnames('h5p-order-priority-description')}>{description}</div>
                <div ref={el => this.resourceContainer = el} />
            </header>
        );
    }

};
