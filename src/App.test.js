import {fireEvent, render, screen} from '@testing-library/react';
import App from './App';

test('testTitle', () => {
    render(<App/>);
    const linkElement = screen.getByText(/START/i);
    expect(linkElement).toBeInTheDocument();
});

test('startGame', () => {
    render(<App/>);
    let WG_startPage = document.getElementById('WG_startPage');
    let startButton = document.querySelectorAll('.TitleSingleButton')[0];
    fireEvent.click(WG_startPage);
    setTimeout(() => {
        fireEvent.click(startButton);
        getText();
    }, 100);

    function getText() {
        setTimeout(() => {
            const linkElement = screen.getByText(/你到得真早/i);
            expect(linkElement).toBeInTheDocument();
        }, 300)
    }
})

test('backLog', () => {
    render(<App/>);
    let WG_startPage = document.getElementById('WG_startPage');
    let startButton = document.querySelectorAll('.TitleSingleButton')[0];
    fireEvent.click(WG_startPage);
    setTimeout(() => {
        fireEvent.click(startButton);
        clickOnTextBox();
    }, 100);

    function clickOnTextBox() {
        for (let i = 0; i < 10; i++) {
            setTimeout(() => {
            }, 100)
            fireEvent.click(document.getElementById('mainTextWindow'));
        }
        fireEvent.click(document.querySelectorAll('.controlButton')[0]);
        setTimeout(getText, 1000);
    }

    function getText() {
        const linkElement = screen.getByText(/你到得真早/i);
        expect(linkElement).toBeInTheDocument();
    }

    // function closeBackLog(){
    //
    // }
})