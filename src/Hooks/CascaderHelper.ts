export const cascaderFilter: any = (inputValue: any, path: any) => {
    return (
        path.some(
            (option: any) => (option.label as string).toLowerCase().indexOf(inputValue.toLowerCase()) > -1,
        )
    )
}