import React from 'react';
import { UiEvent } from 'types';
import "web/src/styling/modal.css"

type MyProps = { handleClose: any, eventEditing: UiEvent };
type MyState = { name: string, description: string };

class EventEditModal extends React.Component<MyProps, MyState> {
  constructor(props: any) {
    super(props);
    this.state = {
      name: this.props.eventEditing.name,
      description: this.props.eventEditing.description
    };
  }

  render() {
    return (
      <section className="event-modal">
        <div className="modal-main">
          <h1 className="modal-title">Name</h1>
          <textarea
            className="modal-textarea"
            value = {this.state.name}
            onChange={(event)=>{
              this.setState({
                  name :event.target.value
              });
            }}
          >
          </textarea>
          <h1 className="modal-title">Description</h1>
          <textarea
            className="modal-textarea"
            value = {this.state.description}
            onChange={(event)=>{
              this.setState({
                  description :event.target.value
              });
            }}
          >
          </textarea>
          <button 
            className="modal-button"
            onClick={() => this.props.handleClose()}>
            Close
          </button>
          <button
            className="modal-button"
            onClick={() => this.props.handleClose(this.props.eventEditing.id, this.state.name, this.state.description)}>
            Confirm
          </button>
        </div>
      </section>
    );
  }
}

export default EventEditModal;