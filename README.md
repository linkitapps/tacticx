# Tacticx.app

A simple, web-based tactical board designed for football coaches, analysts, and enthusiasts.

<!-- Replace with actual screenshot when available -->
<!-- ![Tacticx](https://tacticx-37mr2c6yq-bautista333-gmailcoms-projects.vercel.app/) -->

## Overview

Tacticx.app enables users to create, save, and share static football tactics using an intuitive drag-and-drop interface. The app features a modern dark mode design with vibrant Tactical Orange accents, providing a sleek and focused environment for tactical planning.

## Key Features

- **Interactive Tactical Board**: Drag-and-drop player markers, create arrows with different styles, and add text annotations.
- **Player Customization**: Change player colors, numbers, and team affiliation.
- **Arrow Styles**: Choose between solid, dashed, and dotted arrows with adjustable width and color.
- **Text Annotations**: Add and edit text anywhere on the field.
- **Responsive Design**: Works on desktop, tablet, and mobile devices.
- **Sharing**: Save and share your tactics with others.

## Technologies Used

- **Frontend**: Next.js 14, React, TailwindCSS, ShadCN UI
- **State Management**: Zustand
- **Deployment**: Vercel
- **Authentication**: Coming soon with Supabase Auth
- **Database**: Coming soon with Supabase Postgres

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Mozi333/tacticx.git
cd tacticx
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Usage

1. **Creating Players**: Select the "Player" tool and click anywhere on the field to place a player.
2. **Drawing Arrows**: Select the "Arrow" tool, click to set the start point, then click again to place the end point.
3. **Adding Text**: Select the "Text" tool and click on the field to add text.
4. **Selecting Elements**: Use the "Select" tool to click on any element (player, arrow, text) to select it.
5. **Editing Properties**: When an element is selected, use the properties panel on the right to modify its appearance.
6. **Deleting Elements**: Select an element and press Delete, or use the delete button in the properties panel.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- ShadCN UI for the component library
- Vercel for hosting
- Zustand for state management
- Next.js team for the fantastic framework

## Live Demo

Visit [Tacticx.app](https://tacticx-37mr2c6yq-bautista333-gmailcoms-projects.vercel.app/) to see the live application. 