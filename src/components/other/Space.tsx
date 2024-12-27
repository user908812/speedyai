export const Space = (props: {readonly spaces?: number}) => {

    const allSpaces: JSX.Element[] = [];

    for (let i = 0; i < (props.spaces ? props.spaces : 1); i++) {
        allSpaces.push(<br key={i} />);
    }
    return allSpaces.map(space => space);
}