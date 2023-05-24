import {render} from '@testing-library/react';
import App from './App';

test('renders app', () => {
  // Mocking electron functionality
  window.electron = { 
    listenToGraphFiles: jest.fn(), 
    getGraphFiles: jest.fn(), 
    setState: jest.fn(), 
    clearGraphFilesListener: jest.fn(),
    listenToChanges: jest.fn(),
    listenToInvites: jest.fn(),
    clearChangeListener: jest.fn(),
    clearInviteListener: jest.fn(),
    listenToNetwork: jest.fn(),
    loadNetwork: jest.fn(),
  };

  const screen= render(<App />);
  const element = screen.getByText(/DCR Graph App/i);
  expect(element).toBeInTheDocument();
});