"use client";
import React from "react";
import * as _Builtin from "../_Builtin";

export function ComponentButtonSizeVariants(
    {
        as: _Component = _Builtin.Block,

        buttonLink = {
            href: "#"
        },

        buttonButtonText = "[ Button ]",
        iconsTurnIconVisibilityOn = false,
        iconsJackIcon = false,
        iconsArrowIcon = true,
        iconsStarIcon = false,
        iconsImageIcon = false,
        iconsIconImage = "https://cdn.prod.website-files.com/6994ad8d279287de73c3a891/6994ad8d279287de73c3a8fc_close-x.svg",
        iconsIconImageAltText = "__wf_reserved_inherit",
        buttonId,
        buttonVisibility = true,
        optionsButtonSizeVariants = "Base"
    }
) {
    const _styleVariantMap = {
        "XS": "w-variant-5d1df744-0e60-6ed9-bcc3-7188a7f37697",
        "SM": "w-variant-5d1df744-0e60-6ed9-bcc3-7188a7f37698",
        "Base": "",
        "MD": "w-variant-5d1df744-0e60-6ed9-bcc3-7188a7f37699",
        "LG": "w-variant-5d1df744-0e60-6ed9-bcc3-7188a7f3769a",
        "XL": "w-variant-5d1df744-0e60-6ed9-bcc3-7188a7f3769b"
    };

    const _activeStyleVariant = _styleVariantMap[optionsButtonSizeVariants];

    return (
        <_Component className={`component_button ${_activeStyleVariant}`} tag="div"><_Builtin.Block
                className={`component_button-size-variants ${_activeStyleVariant}`}
                tag="div">{buttonVisibility ? <_Builtin.Link
                    className={`buton_variant ${_activeStyleVariant}`}
                    button={true}
                    id={buttonId}
                    block=""
                    options={buttonLink}>{buttonButtonText}</_Builtin.Link> : null}{iconsTurnIconVisibilityOn ? <_Builtin.Block className={`icon_spacer ${_activeStyleVariant}`} tag="div" /> : null}{iconsTurnIconVisibilityOn ? <_Builtin.Block className={`icon_size-variant ${_activeStyleVariant}`} tag="div">{iconsImageIcon ? <_Builtin.Block className={`component-icon_visibility ${_activeStyleVariant}`} tag="div">{iconsImageIcon ? <_Builtin.Image
                            className={`component_icon-image ${_activeStyleVariant}`}
                            loading="lazy"
                            width="auto"
                            height="auto"
                            src={iconsIconImage} /> : null}</_Builtin.Block> : null}{iconsJackIcon ? <_Builtin.Block className={`component-icon_visibility ${_activeStyleVariant}`} tag="div">{iconsJackIcon ? <_Builtin.HtmlEmbed
                            className={`component_jack-icon ${_activeStyleVariant}`}
                            value="%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22UTF-8%22%3F%3E%0A%3Csvg%20preserveAspectRatio%3D%22xMidYMid%22%20version%3D%221.1%22%20viewBox%3D%220%200%20100%20100%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%0A%20%20%20%20%3C!--Generated%20by%20IJSVG%20(https%3A%2F%2Fgithub.com%2Ficonjar%2FIJSVG)--%3E%0A%20%20%20%20%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M82.466%2060.066c-.01-.006-.022-.009-.032-.015l.034-.059%20-17.31-9.994%2017.39-10.04%20-.005-.009c.923-.57%201.233-1.774.687-2.72%20-.012-.021-.029-.038-.042-.059l.011-.006%20-5.52-9.562%20-.007.004c-.56-.91-1.729-1.225-2.669-.72l-.004-.006%20-17.421%2010.062V16.793h-.01c-.033-1.083-.919-1.953-2.01-1.953%20-.025%200-.048.006-.073.007v-.013h-11.04v.007c-1.069.03-1.926.886-1.957%201.952h-.006v20.115l-17.45-10.075%20-.006.01c-.956-.513-2.151-.183-2.697.764%20-.012.021-.018.044-.03.065l-.01-.006%20-5.52%209.562%20.005.003c-.508.94-.196%202.11.712%202.672l-.002.003%20.035.02c.006.003.01.008.016.011%20.006.003.012.005.018.008l17.411%2010.052%20-17.028%209.832c-.146.044-.289.101-.426.18%20-.961.553-1.29%201.781-.743%202.74l-.007.004%205.711%209.892%20.032-.019c.617.738%201.689.951%202.55.455%20.011-.006.019-.015.03-.021l.032.056%2017.369-10.027v19.593c-.035.149-.058.302-.058.461%200%201.108.895%202.005%202%202.014v.007h11.422v-.037c.948-.165%201.67-.986%201.67-1.98%200-.012-.003-.023-.004-.035h.066V63.056l16.967%209.796c.112.105.233.202.371.282%20.959.556%202.185.227%202.745-.724l.005.003%205.534-9.587c.001-.001.002-.002.003-.004s.001-.003.002-.004l.173-.299%20-.03-.018c.328-.903-.023-1.937-.884-2.435Z%22%2F%3E%0A%3C%2Fsvg%3E" /> : null}</_Builtin.Block> : null}{iconsArrowIcon ? <_Builtin.Block className={`component-icon_visibility ${_activeStyleVariant}`} tag="div">{iconsArrowIcon ? <_Builtin.HtmlEmbed
                            className={`component_arrow-icon ${_activeStyleVariant}`}
                            value="%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22UTF-8%22%3F%3E%0A%3Csvg%20preserveAspectRatio%3D%22xMidYMid%22%20version%3D%221.1%22%20viewBox%3D%220%200%20400%20400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%0A%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M388.84%20229.402l-.299-.758c-9.093-22.005-18.909-45.589-29.051-68.917l-.572-1.365c-1.83-4.389-3.903-9.363-7.125-12.595l-.207-.191c-27.72-23.371-83.048-69.988-121.532-102.411l-35.8-30.164c-.083-.07-.162-.146-.237-.227%20-5.307-5.702-12.392-7.635-18.151-4.918%20-5.403%202.549-8.721%208.562-9.103%2016.495l-.005.195c-.031%209.405-.025%2023.267-.019%2035.661%20.004%207.617.007%2014.679.001%2019.807%200%20.014-.002.028-.002.041%20-.108%201.963-1.44%203.51-3.104%203.513%20-14.817.026-54.83.018-88.026.011%20-25.113-.006-46.534-.011-50.841.002%20-4.127.096-9.723%202.585-13.057%209.285l-.094.202c-2.482%205.786-2.266%2011.365-2.059%2016.762%20.103%202.662.209%205.413.006%208.278l-.011.279c-.026%204.038-.066%208.607-.108%2013.529%20-.494%2057.932-.277%2090.536%202.304%2096.97%205.828%2013.954%2011.956%2028.472%2017.882%2042.513%204.298%2010.182%208.58%2020.327%2012.758%2030.281%20.078.185.138.38.186.579%203.755%2015.514%2028.739%2015.275%2057.596%2015.006%204.86-.046%209.886-.093%2014.88-.062%206.848-.083%2014.996-.449%2022.874-.805%2012.139-.545%2024.68-1.111%2033.106-.685%20.739.037%201.443.37%201.976.975%201.855%202.105%203.722%207.098%205.048%2010.643%20.965%202.582%201.877%205.02%202.825%206.848%201.465%203.023%203.33%208.068%205.49%2013.909%207.504%2020.295%2016.737%2045.27%2028.872%2045.267%20.728%200%201.468-.09%202.217-.276l.282-.07%20.266-.13c8.997-4.39%2058.627-46.791%20117.7-97.582%2024.118-20.737%2044.947-38.647%2049.055-41.628l.179-.139c5.753-4.849%207.621-16.516%203.898-24.129ZM32.245%20212.775l-.004-93.684c0-2.036%201.396-3.687%203.117-3.687l150.764.005c1.722%200%203.117-1.65%203.117-3.686V53.391c0-2.995%202.86-4.74%204.924-3.005l133.401%20112.137c1.745%201.467%201.749%204.53.008%206.003L194.167%20281.39c-2.063%201.745-4.931.002-4.931-2.998v-58.243c0-2.036-1.396-3.686-3.117-3.686H35.362c-1.722%200-3.117-1.65-3.117-3.686Z%22%2F%3E%3C%2Fsvg%3E" /> : null}</_Builtin.Block> : null}{iconsStarIcon ? <_Builtin.Block className={`component-icon_visibility ${_activeStyleVariant}`} tag="div">{iconsStarIcon ? <_Builtin.HtmlEmbed
                            className={`component_star-icon ${_activeStyleVariant}`}
                            value="%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20enable-background%3D%22new%200%200%2024%2024%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22currentColor%22%3E%3Cg%3E%3Cpath%20d%3D%22M0%200h24v24H0V0z%22%20fill%3D%22none%22%2F%3E%3Cpath%20d%3D%22M0%200h24v24H0V0z%22%20fill%3D%22none%22%2F%3E%3C%2Fg%3E%3Cg%3E%3Cpath%20d%3D%22m12%2017.27%204.15%202.51c.76.46%201.69-.22%201.49-1.08l-1.1-4.72%203.67-3.18c.67-.58.31-1.68-.57-1.75l-4.83-.41-1.89-4.46c-.34-.81-1.5-.81-1.84%200L9.19%208.63l-4.83.41c-.88.07-1.24%201.17-.57%201.75l3.67%203.18-1.1%204.72c-.2.86.73%201.54%201.49%201.08l4.15-2.5z%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E" /> : null}</_Builtin.Block> : null}</_Builtin.Block> : null}</_Builtin.Block></_Component>
    );
}