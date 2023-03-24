# Landing Assist
![Site](https://img.shields.io/website?url=https%3A%2F%2Flandingassist.moverperfect.com)
![GitHub deployments](https://img.shields.io/github/deployments/moverperfect/landingassist/github-pages?label=deployment)
![GitHub last commit](https://img.shields.io/github/last-commit/moverperfect/landingassist?label=last%20activity)
![GitHub issues](https://img.shields.io/github/issues-raw/moverperfect/landingassist)
[![MegaLinter](https://github.com/moverperfect/landingassist/workflows/MegaLinter/badge.svg?branch=main)](https://github.com/moverperfect/landingassist/actions?query=workflow%3AMegaLinter+branch%3Amain)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=moverperfect_landingassist&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=moverperfect_landingassist)
![GitHub](https://img.shields.io/github/license/moverperfect/landingassist)

Landing Assist is a site that helps beginner skydivers to land accurately. This project provides a simple and interactive way to plan a landing pattern, considering variables such as wind speed, wind direction, and canopy speed. The site is built using HTML, CSS, and JavaScript, and uses the Leaflet library for the map functionality.

## Features
* Select a drop zone from a dropdown list
* Input wind speed, wind direction, and canopy speed
* Choose between a left-hand or right-hand landing pattern
* Choose whether to calculate a crab angle or assume the parachutist faces - perpendicular to the wind during the crosswind section
* Optional advanced settings for downwind height, base height, and final height
* Displays landing pattern on a map with Bing Aerial imagery
* Calculates and displays the crab angle

## GitHub Actions
This project uses the following GitHub Actions:

* Dependabot is fully enabled to automatically check for and update dependencies
* Super-Linter is enabled for pull requests and branch pushes to ensure code quality
* An action is triggered to deploy the project to GitHub Pages when changes are made to the main branch

## License
This project is licensed under the GNU General Public License v3.0.

## Usage
To use the site, visit <https://landingassist.moverperfect.com>

## Contributing
Contributions to this project are welcome. To contribute, please fork the repository and submit a pull request with your changes.

## Acknowledgements
This project uses the following libraries:

* Bootstrap for styling
* GeographicLib for geodesic calculations
* Leaflet for the map functionality

## Authors
[moverperfect](https://github.com/moverperfect)
