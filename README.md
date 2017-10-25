# WLERA

The Western Lake Erie Restoration Assessment (WLERA) model was co-developed by investigators in the Environmental Studies Program at the New College of Florida in Sarasota, Florida and the USGS - Great Lakes Science Center in Ann Arbor, Michigan. The web mapping application for interfacing with the WLERA model was developed by programmers at the Wisconsin Internet Mapping Group.

The WLERA is a geodesign framework for measuring the potential to restore coastal wetlands in the Great Lakes basin. This framework is based on the expert coupling of multiple criteria decision analysis and geographic information systems. Experts included regional wetland ecologists, biologists, planners and geographers from federal, state, academic and non- governmental organizations. Criteria include historical water levels, topography, soils, mapped wetlands, managed lands, and impervious and non-impervious development on the landscape. The WLERA data and kernel analysis are organized in ArcGIS 10.3 geodatabases and python applications.

Within the 195,621 ha study area between the mouths of the Detroit River, MI and Black River, OH, the WLERA normalized composite index model identified over 7,500 hectares of areas highly suitable for coastal wetland habitat restoration. The model results 1) range from 0-100 (green to red) with increasing values representing higher potential for restoration 2) have a pyramided spatial resolution of 1 meter at the lowest level, and 3) can be aggregated by any irregular area, including individual land ownership parcel boundaries or custom boundaries created with the Area Summary Tool in the web mapping application. Areas with the highest restorability class (greater than 80) coincided with 10 areas currently selected by GLRI for restoration in WLE. As the region continues to restore coastal wetland habitats, this tool and analysis will support restoration decisions.

The development of the WLERA has been supported by the Great Lakes Restoration Initiative, the Upper Midwest and Great Lakes Landscape Conservation Cooperative and the University of Michigan Water Center.
___
##Developer Instructions

run `npm install` AND `bower install` to get dependencies after first cloning

`gulp watch` to run in browser with watch for debugging

`gulp build` to build project

**NOTE**: You **MUST** run the `gulp build` before committing and pushing to repo

## Deployment

Deploy to AWS S3 bucket glcwra.wim.usgs.gov, wlera directory

## Built With

* [ArcGIS API for Javascript](https://developers.arcgis.com/javascript/) - Mapping engine
* [ArcGIS Server](http://server.arcgis.com/en/) - map services and geoprocessing services
* [NPM](https://www.npmjs.com/) - Dependency Management

## Contributing

Please read [CONTRIBUTING.md]() for details on the process for submitting pull requests to us. Please read [CODE_OF_CONDUCT.md]() for details on adhering by the [USGS Code of Scientific Conduct](https://www2.usgs.gov/fsp/fsp_code_of_scientific_conduct.asp).

####Semver versioning/release tags

Advance the version when adding features, fixing bugs or making minor enhancement. Follow semver principles. To add tag in git,  type `git tag v{major}.{minor}.{patch}`. Example: `git tag v2.0.5`

First push tags to origin: `git push origin --tags` then, after pull request, upstream: `git push upstream --tags`  Note that your alias for the upstream repo may differ

## Authors

* **[Blake Draper](https://www.usgs.gov/staff-profiles/blake-a-draper)**  - *Lead Developer* - [USGS Web Informatics & Mapping](https://wim.usgs.gov/)


See also the list of [contributors](https://github.com/USGS-WiM/WLERA/graphs/contributors) who participated in this project.

## License

This project is licensed under the Creative Commons CC0 1.0 Universal License - see the [LICENSE.md](LICENSE.md) file for details

## Suggested Citation
In the spirit of open source, please cite any re-use of the source code stored in this repository. Below is the suggested citation:

`This project contains code produced by the Web Informatics and Mapping (WIM) team at the United States Geological Survey (USGS). As a work of the United States Government, this project is in the public domain within the United States. https://wim.usgs.gov`


## About WIM
* This project authored by the [USGS WIM team](https://wim.usgs.gov)
* WIM is a team of developers and technologists who build and manage tools, software, web services, and databases to support USGS science and other federal government cooperators.
* WiM is a part of the [Upper Midwest Water Science Center](https://www.usgs.gov/centers/wisconsin-water-science-center).
